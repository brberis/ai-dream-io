// import * as React from "react";
// import Paper from "@mui/material/Paper";
// import Stack from "@mui/material/Stack";
// import { styled } from "@mui/material/styles";

// const Item = styled(Paper)(({ theme }) => ({
//   backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: "center",
//   color: theme.palette.text.secondary,
// }));

// export default function ResponsiveStack() {
//   return (
//     <div>
//       <Stack
//         direction={{ xs: "column", sm: "row" }}
//         spacing={{ xs: 1, sm: 2, md: 4 }}
//       >
//         <Item>Item 1</Item>
//         <Item>Item 2</Item>
//         <Item>Item 3</Item>
//       </Stack>
//     </div>
//   );
// }
import React, { useEffect } from "react";
import CartItem from "../CartItem";
import Auth from "../../utils/auth";
// import { useStoreContext } from '../../utils/GlobalState';
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from "../../utils/actions";
import { idbPromise } from "../../utils/helpers";
import { QUERY_CHECKOUT } from "../../utils/queries";
import { loadStripe } from "@stripe/stripe-js";
import { useLazyQuery } from "@apollo/react-hooks";
// import { useSelector, useDispatch } from "react-redux";
import { useStoreContext } from "../../utils/GlobalState";
import "./style.css"

const stripePromise = loadStripe("pk_test_53EV49EHulEpkScQouWloySW00atAj6KCx");

const Cart = () => {
  // const [state, dispatch] = useStoreContext();
//   const state = useSelector((state) => state);
  const [state, dispatch] = useStoreContext();

//   const dispatch = useDispatch();

  const [getCheckout, { data: productsData }] = useLazyQuery(QUERY_CHECKOUT);
console.log("here is some", data);
  useEffect(() => {
    async function getCart() {
      const cart = await idbPromise("cart", "get");
      dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
    }

    if (!state.cart.length) {
      getCart();
    }
  }, [state.cart.length, dispatch]);

  useEffect(() => {
    if (data) {
        
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);

  function toggleCart() {
    dispatch({ type: TOGGLE_CART });
  }

  function calculateTotal() {
    let sum = 0;
    state.cart.forEach((item) => {
      sum += item.price * item.purchaseQuantity;
    });
    return sum.toFixed(2);
  }

  function submitCheckout() {
    const productIds = [];

    state.cart.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }
    });
    getCheckout({
      variables: { products: productIds },
    });
  }

  if (!state.cartOpen) {
    return (
      <div className="cart-closed" onClick={toggleCart}>
        <span role="img" aria-label="trash">
          🛒
        </span>
      </div>
    );
  }
console.log("cart",productsData);
  return (
    <div className="cart">
      <div className="close" onClick={toggleCart}>
        [close]
      </div>
      <h2>Shopping Cart</h2>
      {productsData?.cart.length ? (
        
        <div>
          {productsData.cart.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
          <div className="flex-row space-between">
            <strong>Total: ${calculateTotal()}</strong>
            {Auth.loggedIn() ? (
              <button onClick={submitCheckout}>Checkout</button>
            ) : (
              <span>(log in to check out)</span>
            )}
          </div>
        </div>
      ) : (
        <h3>
          <span role="img" aria-label="shocked">
            😱
          </span>
          You haven't added anything to your cart yet!
        </h3>
      )}
    </div>
  );
};
export default Cart;