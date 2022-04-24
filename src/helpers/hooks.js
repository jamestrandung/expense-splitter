import { useState } from 'react';

export const useInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [isError, setIsError] = useState(false);
  const [helperText, setHelperText] = useState('');

  return {
    props: {
      value,
      onChange: (e) => {
        setValue(e.target.value);
      },
      error: isError,
      helperText,
    },
    value,
    triggerError: (errorMsg) => {
      setIsError(true);
      setHelperText(errorMsg);
    },
    clearError: () => {
      setIsError(false);
      setHelperText('');
    },
    reset: () => {
      setValue(initialValue);
    },
    set: (newValue) => {
      setValue(newValue);
    },
  };
};

export const useDateTime = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [isError, setIsError] = useState(false);
  const [helperText, setHelperText] = useState('');

  return {
    props: {
      value,
      onChange: (newValue) => {
        setValue(newValue);
      },
    },
    inputProps: {
      error: isError,
      helperText,
    },
    value,
    triggerError: (errorMsg) => {
      setIsError(true);
      setHelperText(errorMsg);
    },
    clearError: () => {
      setIsError(false);
      setHelperText('');
    },
    reset: () => {
      setValue(initialValue);
    },
    set: (newValue) => {
      setValue(newValue);
    },
  };
};

export const useCheckbox = (initialValue) => {
  const [checked, onChange] = useState(initialValue);

  return {
    checked,
    onChange(e) {
      onChange(e.target.checked);
    },
  };
};
