import React from 'react';
import ReactSelect, { Styles, Props, ControlProps } from 'react-select';

const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const FONT_SIZE = '14px';

const YB_ERROR = '#a94442';
const YB_BORDER_1 = '#dedee0';
const YB_DISABLED_INPUT_BG = '#eee';
const YB_PAGE_BACKGROUND = '#fff';
const YB_TEXT_1 = '#555555';
const YB_ORANGE = '#ef5824';
const INNER_SHADOW = 'inset 0 1px 1px rgba(0, 0, 0, .075)';

// convert rgba('#555555', 0.2) to proper css string 'rgba(85, 85, 85, 0.2)'
const rgba = (hex: string, opacity: number): string => {
  const rgbArray = hex.slice(1).match(/.{1,2}/g) || []; // '#555555' --> ['55', '55', '55]
  const rgb = rgbArray.map((item) => parseInt(item, 16)); // ['55', '55', '55] --> [85, 85, 85]
  return `rgba(${rgb.join(', ')}, ${opacity})`;
};

// there's no other way to forward extra prop into styles, so use hack with a dummy class name
const isInvalid = (state: ControlProps<{}>): boolean =>
  state.selectProps.className === 'validation-error';

const customStyles: Styles = {
  control: (provided, state) => ({
    ...provided,
    outline: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '7px',
    borderColor: state.isFocused ? rgba(YB_ORANGE, 0.5) : isInvalid(state) ? YB_ERROR : YB_BORDER_1,
    overflow: 'hidden',
    minHeight: '42px',
    width: '100%',
    transition: 'border-color .15s ease-in-out, box-shadow .15s ease-in-out',
    backgroundColor: state.isDisabled ? YB_DISABLED_INPUT_BG : YB_PAGE_BACKGROUND,
    boxShadow: state.isFocused
      ? isInvalid(state)
        ? `${INNER_SHADOW}, 0 0 6px ${YB_ERROR}`
        : `${INNER_SHADOW}, 0 0 8px ${rgba(YB_ORANGE, 0.2)}`
      : INNER_SHADOW,
    ':hover': {
      // duplicate non-hover styles
      borderColor: state.isFocused
        ? rgba(YB_ORANGE, 0.5)
        : isInvalid(state)
        ? YB_ERROR
        : YB_BORDER_1
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
    color: YB_TEXT_1,
    opacity: 0.5
  }),
  singleValue: (provided) => ({
    ...provided,
    color: YB_TEXT_1
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e6e6e6',
    borderRadius: '2px',
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
    color: YB_TEXT_1
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    cursor: 'pointer',
    color: rgba(YB_TEXT_1, 0.5),
    ':hover': {
      color: YB_TEXT_1
    }
  }),
  clearIndicator: (provided) => ({
    ...provided,
    cursor: 'pointer',
    color: rgba(YB_TEXT_1, 0.5),
    ':hover': {
      color: YB_TEXT_1
    }
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: YB_BORDER_1
  }),
  dropdownIndicator: (provided) => ({
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
    borderTop: `7px solid ${rgba(YB_TEXT_1, 0.5)}`,
    ':hover': {
      borderTopColor: YB_TEXT_1
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
    color: YB_TEXT_1,
    fontSize: FONT_SIZE,
    fontWeight: 700,
    fontFamily: FONT_FAMILY
  })
};

export const Select = <T extends {}>(props: Props<T>) => (
  <ReactSelect<T> styles={customStyles} {...props} />
);
