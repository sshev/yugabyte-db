import React from 'react';
import ReactSelect, { Styles, Props } from 'react-select';

const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const FONT_SIZE = '14px';

const customStyles: Styles = {
  control: (provided, state) => ({
    ...provided,
    outline: 'none',
    // hack to show red border on validation error as there's no other way to forward extra prop into styles
    border: `1px solid ${
      state.selectProps.className === 'validation-error' ? '#a94442' : '#C5C6CE'
    }`,
    borderRadius: '7px',
    overflow: 'hidden',
    minHeight: '42px',
    width: '100%',
    backgroundColor: state.isDisabled ? '#eee' : '#fff',
    boxShadow:
      state.selectProps.className === 'validation-error' ? '0 0 5px rgba(169, 68, 66, 0.2)' : 'none',
    ':hover': {
      border: `1px solid ${
        state.selectProps.className === 'validation-error' ? '#a94442' : '#C5C6CE'
      }`,
      boxShadow:
        state.selectProps.className === 'validation-error' ? '0 0 5px rgba(169, 68, 66, 0.2)' : 'none'
    },
    fontSize: FONT_SIZE,
    fontWeight: 400,
    fontFamily: FONT_FAMILY
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    padding: 0,
    paddingLeft: state.hasValue ? (state.isMulti ? '5px' : '12px') : '12px'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#546371',
    opacity: 0.5
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#546371'
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#E8E9F3',
    borderRadius: '7px',
    overflow: 'hidden'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    // have to provide every padding separately in order to override provided defaults
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: '8px',
    paddingRight: 0,
    fontSize: FONT_SIZE,
    color: '#546371'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    cursor: 'pointer',
    color: '#5463717F',
    ':hover': {
      color: '#546371'
    }
  }),
  clearIndicator: (provided) => ({
    ...provided,
    cursor: 'pointer',
    color: '#5463717F',
    ':hover': {
      color: '#546371'
    }
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: '#C5C6CE'
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    cursor: 'pointer',
    marginTop: '2px',
    marginLeft: '12px',
    marginRight: '14px',
    padding: 0,
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '7px solid #5463717F',
    ':hover': {
      borderTopColor: '#546371'
    }
  }),
  menu: (provided) => ({
    ...provided,
    fontSize: FONT_SIZE,
    fontWeight: 400,
    fontFamily: FONT_FAMILY
  }),
  groupHeading: (provided) => ({
    ...provided,
    color: '#546371',
    fontSize: FONT_SIZE,
    fontWeight: 700,
    fontFamily: FONT_FAMILY
  })
};

export const Select = <T extends {}>(props: Props<T>) => (
  <ReactSelect<T> styles={customStyles} {...props} />
);
