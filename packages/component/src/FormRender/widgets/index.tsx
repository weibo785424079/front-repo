/* eslint-disable react/prop-types */
import React from 'react';
import { Input, Rate, InputNumber, TreeSelect, Slider } from 'antd';
import { createBaseWidget } from './createBaseWidget';
import TimePicker from './antd/TimePicker';
import Select, { MultiSelect } from './antd/Select';
import Radio from './antd/Radio';
import DatePicker from './antd/DatePicker';
import DateRangePicker from './antd/DateRangePicker';
import CheckboxGroup from './antd/Checkbox';
import CheckSingle from './antd/CheckSingle';
import Cascader from './antd/Cascader';
import Switch from './antd/Switch';
import Color from './antd/Color';
import UrlInput from './antd/UrlInput';
import Editor from './antd/Editor';
import Upload from './antd/Upload';

import 'antd/es/input/style/index';
import 'antd/es/rate/style/index';
import 'antd/es/input-number/style/index';
import 'antd/es/slider/style/index';
import 'antd/es/tree-select/style/index';

// 组件列表
const widgets = {
  Input: createBaseWidget()(Input),
  TextArea: createBaseWidget(({ autoSize }) => ({
    autoSize: autoSize || { minRows: 3 }
  }))(Input.TextArea),
  InputNumber: createBaseWidget(({ style }) => ({ style: { width: '100%', ...style } }))(InputNumber),
  InputSearch: createBaseWidget(({ style }) => ({ style: { width: '100%', ...style } }))(Input.Search),
  Checkbox: CheckSingle,
  CheckboxGroup,
  Rate: createBaseWidget()(Rate),
  Slider: createBaseWidget()(Slider),
  Switch,
  DatePicker,
  DateRangePicker,
  TimePicker,
  Select,
  MultiSelect,
  TreeSelect: ({ style, ...rest }) => <TreeSelect style={{ width: '100%', ...style }} {...rest} />,
  Radio,
  Color,
  UrlInput,
  Cascader,
  Editor,
  Upload
};

export type widgetsType = keyof typeof widgets;

export const setWidgets = (key: string, val: any) => {
  widgets[key] = val;
};
export const getWidgets = () => ({
  ...widgets
});
export default widgets;
