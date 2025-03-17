const { date, string } = require("joi");
const db = require("../database/db");
const actual_date = string;
this.actual_date = "20250317";


exports.createOrder = async (params) => {
  console.log(actual_date.getDay); 
  const { userId, cart } = params;
  //console.log("Usuario", params);
  if (!cart) throw { message: "cart was not provided", statusCode: 400 };
  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO orders (user_id, order_date) VALUES (?,?)`,
      [userId, this.actual_date],
      (err, result) => {
        if (err) reject({ message: err, statusCode: 500 });

        if (result) {
          let newOrderId = result.insertId;
          cart.products.forEach(async (prod) => {
            db.query(
              `SELECT p.quantity FROM products p WHERE p.id = ?`,
              [prod.id],
              (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });

                let productQuantity = result[0].quantity; // db product

                // deduct the quantity from products that were ordered in db
                let updatedQuantity = productQuantity - prod.quantity;
                if (updatedQuantity > 0) {
                  productQuantity = updatedQuantity;
                } else productQuantity = 0;

                db.query(
                  `INSERT INTO orders_details (order_id, product_id, quantity) VALUES (?,?,?)`,
                  [newOrderId, prod.id, prod.quantity],
                  (err, result) => {
                    if (err) reject({ message: err, statusCode: 500 });

                    db.query(
                      `UPDATE products SET quantity = ${productQuantity} WHERE id = ${prod.id}`,
                      (err, result) => {
                        if (err) reject({ message: err, statusCode: 500 });
                        console.log(result);
                      }
                    );
                  }
                );
              }
            );
          });

          resolve({
            message: `Order was successfully placed with order id ${newOrderId}`,
            orderId: newOrderId,
            products: cart.products,
            statusCode: 200,
          });
        } else {
          reject({
            message: "New order failed while adding order details",
            statusCode: 500,
          });
        }
      }
    );
  });
};

exports.getSingleOrder = async (params) => {
  const { orderId, userId } = params;

  if (!orderId) throw { message: "orderId was not provided", statusCode: 400 };
  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE orders.id = ? AND orders.user_id = ?`,
      [orderId, userId],
      (err, result) => {
        if (err) reject({ message: err, statusCode: 500 });

        if (result.length === 0)
          reject({ message: "order was not found", statusCode: 400 });

        resolve({
          statusCode: 200,
          message: `Order was found`,
          data: result,
        });
      }
    );
  });
};

exports.getOrders = async (params) => {
  const { userId } = params;

  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE user_id = ?`,
      [userId],
      (err, result) => {
        if (err) reject({ message: err, statusCode: 500 });

        if (result.length === 0)
          reject({ message: "No order were found", statusCode: 400 });

        resolve({
          statusCode: 200,
          message: `${result.length} orders were found`,
          data: result,
        });
      }
    );
  });
};
