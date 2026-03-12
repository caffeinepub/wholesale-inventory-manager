import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  public type Product = {
    id : Nat;
    name : Text;
    category : Text;
    sku : Text;
    unit : Text;
    costPrice : Float;
    sellingPrice : Float;
    currentStock : Nat;
    reorderLevel : Nat;
    createdAt : Int;
  };

  public type MovementType = { #stockIn; #out };

  public type StockMovement = {
    id : Nat;
    productId : Nat;
    movementType : MovementType;
    quantity : Nat;
    note : Text;
    timestamp : Int;
  };

  public type ReportSummary = {
    totalIn : Nat;
    totalOut : Nat;
    netChange : Int;
  };

  public type ReportResult = {
    movements : [StockMovement];
    productSummaries : [(Nat, ReportSummary)];
    overallSummary : ReportSummary;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  module StockMovement {
    public func compare(movement1 : StockMovement, movement2 : StockMovement) : Order.Order {
      Nat.compare(movement1.id, movement2.id);
    };
  };

  // State
  let products = Map.empty<Nat, Product>();
  let movements = Map.empty<Nat, StockMovement>();

  var nextProductId = 1;
  var nextMovementId = 1;

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Product CRUD
  public shared ({ caller }) func createProduct(
    name : Text,
    category : Text,
    sku : Text,
    unit : Text,
    costPrice : Float,
    sellingPrice : Float,
    reorderLevel : Nat,
    createdAt : Int,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };
    let id = nextProductId;
    nextProductId += 1;

    let product : Product = {
      id;
      name;
      category;
      sku;
      unit;
      costPrice;
      sellingPrice;
      currentStock = 0;
      reorderLevel;
      createdAt;
    };

    products.add(id, product);
    id;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    category : Text,
    sku : Text,
    unit : Text,
    costPrice : Float,
    sellingPrice : Float,
    reorderLevel : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        let updated : Product = {
          id;
          name;
          category;
          sku;
          unit;
          costPrice;
          sellingPrice;
          currentStock = existing.currentStock;
          reorderLevel;
          createdAt = existing.createdAt;
        };
        products.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete products");
    };
    products.remove(id);
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  // Stock Movements
  public shared ({ caller }) func recordStockMovement(
    productId : Nat,
    movementType : MovementType,
    quantity : Nat,
    note : Text,
    timestamp : Int,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record stock movements");
    };

    // Validate product
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    // Validate quantity
    if (quantity <= 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    // Check stock for out movements
    switch (movementType) {
      case (#out) {
        if (product.currentStock < quantity) {
          Runtime.trap("Insufficient stock for product " # productId.toText() # ": " # product.name);
        };
      };
      case (#stockIn) {};
    };

    // Create movement
    let movementId = nextMovementId;
    nextMovementId += 1;

    let movement : StockMovement = {
      id = movementId;
      productId;
      movementType;
      quantity;
      note;
      timestamp;
    };

    movements.add(movementId, movement);

    // Update product stock
    let newStock = switch (movementType) {
      case (#stockIn) { product.currentStock + quantity };
      case (#out) { product.currentStock - quantity };
    };

    let updatedProduct : Product = {
      product with currentStock = newStock
    };
    products.add(productId, updatedProduct);

    movementId;
  };

  // Reports
  public query ({ caller }) func getReport(startTime : Int, endTime : Int) : async ReportResult {
    let filteredMovements = movements.values().toArray().filter(
      func(movement) {
        movement.timestamp >= startTime and movement.timestamp <= endTime
      }
    );

    let productSummaries = Map.empty<Nat, ReportSummary>();

    // Aggregate per product
    for (movement in filteredMovements.values()) {
      let productId = movement.productId;
      let currentSummary = switch (productSummaries.get(productId)) {
        case (null) {
          {
            totalIn = 0;
            totalOut = 0;
            netChange = 0;
          };
        };
        case (?summary) { summary };
      };

      let quantity = movement.quantity;
      let updatedSummary : ReportSummary = switch (movement.movementType) {
        case (#stockIn) {
          {
            totalIn = currentSummary.totalIn + quantity;
            totalOut = currentSummary.totalOut;
            netChange = currentSummary.netChange + quantity;
          };
        };
        case (#out) {
          {
            totalIn = currentSummary.totalIn;
            totalOut = currentSummary.totalOut + quantity;
            netChange = currentSummary.netChange - quantity;
          };
        };
      };

      productSummaries.add(productId, updatedSummary);
    };

    // Calculate overall summary
    var totalIn = 0;
    var totalOut = 0;

    for (movement in filteredMovements.values()) {
      switch (movement.movementType) {
        case (#stockIn) { totalIn += movement.quantity };
        case (#out) { totalOut += movement.quantity };
      };
    };

    let overallSummary : ReportSummary = {
      totalIn;
      totalOut;
      netChange = totalIn - totalOut;
    };

    {
      movements = filteredMovements.sort();
      productSummaries = productSummaries.toArray();
      overallSummary;
    };
  };

  // Queries
  public query ({ caller }) func getMovementsForProduct(productId : Nat) : async [StockMovement] {
    movements.values().toArray().filter(
      func(movement) { movement.productId == productId }
    ).sort();
  };

  public query ({ caller }) func getLowStockProducts() : async [Product] {
    products.values().toArray().filter(
      func(product) { product.currentStock <= product.reorderLevel }
    ).sort();
  };
};
