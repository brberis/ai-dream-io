import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    Grid,
    CardContent,
    Typography,
    CardHeader
} from '@material-ui/core/'
import Auth from '../utils/auth';
import { Navigate } from 'react-router-dom';
import CardActions from "@material-ui/core/CardActions";
import Button from "@mui/material/Button";
import { Divider } from "@material-ui/core";
import { QUERY_PRODUCTS } from "../utils/queries.js";
import { ADD_ORDER, UPDATE_ORDER } from "../utils/mutations.js";
import { useQuery } from "@apollo/react-hooks";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { loadStripe } from '@stripe/stripe-js';
import { useLazyQuery, useMutation } from '@apollo/client';
import { QUERY_CHECKOUT } from '../utils/queries';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    marginBottom: "50px"
  },
  action: {
    justifyContent: "center",
    marginTop: "20px",
    paddingBottom: "20px"
  },
  button: {
    borderRadius: "50%",
    width: "30px",
    height: "60px"
  }
}))

const stripePromise = loadStripe('pk_test_53EV49EHulEpkScQouWloySW00atAj6KCx');

const AddCredits = () => {
  const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);
  const [addOrder, { data: addOrderRes }] = useMutation(ADD_ORDER);
  const [updateOrder, { data: updateOrderRes }] = useMutation(UPDATE_ORDER);
  const [orderId, setOrderId] = useState(null);

  const { loading, data: productsData } = useQuery(QUERY_PRODUCTS);
  const classes = useStyles();
  
  useEffect(() => {
    if (data) {
      
      const updateOrderData = updateOrder({
        variables: {
          id: orderId,
          sessionId: data.checkout.session,
          // status: 'in progress'
          status: 'in demo'
        }
      });
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);

  async function submitCheckout(id) {

    const orderData = await addOrder({
      variables: {
        products: [id]
      }
    });

    setOrderId(orderData.data.addOrder._id);

    localStorage.setItem('item', id);

    getCheckout({
      variables: { products: [id]
    },
    });
  }

  if (!Auth.loggedIn()) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <>
    <AppBar
        position="absolute"
        color="default"
        elevation={0}
        sx={{ 
          position: 'relative',
          mb: 4,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap>
          Add Credits
        </Typography>
      </Toolbar>
    </AppBar>
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Alert severity="warning">
        Credits will not be added in test mode.
      </Alert>
    </Container>

    <div className={classes.root}>
      <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
      >
          {productsData?.products.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <div className="credits-card">
                    <CardHeader
                        title={product.name}
                    />
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                         ${product.price}
                        </Typography>
                    </CardContent>
                    <Divider variant="middle" />
                    <CardActions className={classes.action}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={()=>submitCheckout(product._id)}
                      >
                        Buy
                      </Button>
                    </CardActions>
                  </div>
                </Grid>
                ))}
            </Grid>
        </div>
    </>
  );
};

export default AddCredits;