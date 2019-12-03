import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Redirect, useLocation } from 'react-router-dom';
import { Box, Input, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import ThemeButton from '../ThemeButton';
import { register } from '../../actions/auth';
import { POST_REGISTER } from '../../actions/types';

import { createLoadingSelector } from '../../api/selectors';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(9),
    paddingLeft: theme.spacing(10),
    paddingRight: theme.spacing(10),

    height: '70rem',
  },
  input: {
    textAlign: 'center',
    boxShadow: theme.boxShadowTheme,
  },
  label: {
    color: 'black',
  },
}));

function SignUpForm({ isAuthenticated, error, registerUser, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const classes = useStyles();
  const location = useLocation();

  if (isAuthenticated) {
    const { from } = location.state || { from: { pathname: '/' } };
    return <Redirect to={from.pathname} />;
  }

  const handleSubmit = event => {
    event.preventDefault();
    const formData = {
      name,
      email,
      password,
    };

    registerUser(formData);
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <InputLabel className={classes.label}>Your name:</InputLabel>
      <Input
        placeholder="Name"
        name="name"
        fullWidth
        value={name}
        onChange={e => setName(e.target.value)}
        classes={{ input: classes.input }}
        disableUnderline
      />

      <InputLabel className={classes.label}>Your e-mail address:</InputLabel>
      <Input
        placeholder="E-mail"
        name="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        classes={{ input: classes.input }}
        fullWidth
        disableUnderline
      />

      <InputLabel className={classes.label}>Password:</InputLabel>
      <Input
        placeholder="Password"
        name="password"
        type="password"
        value={password}
        inputProps={{
          minLength: 6,
        }}
        onChange={e => setPassword(e.target.value)}
        classes={{ input: classes.input }}
        fullWidth
        disableUnderline
      />

      {error && <Box>{error}</Box>}

      <ThemeButton
        text="Create Account"
        type="submit"
        padding="2rem 3rem"
        width="24rem"
        height="6.3rem"
        disabled={!(name && email && password.length >= 6) || loading}
        loading={loading}
      />
    </form>
  );
}

SignUpForm.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  registerUser: PropTypes.func.isRequired,
};

const loadingSelector = createLoadingSelector([POST_REGISTER]);

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  loading: loadingSelector(state),
  error: state.auth.error,
});

const mapDispatchToProps = {
  registerUser: register,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUpForm);
