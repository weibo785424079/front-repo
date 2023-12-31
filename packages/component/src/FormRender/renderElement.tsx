/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React from 'react';
import { Form, Button } from 'antd';
import { ValidationRule, WrappedFormUtils } from 'antd/es/form/Form';
import { usePersistFn } from '@tms/site-hook';
import widgets from './widgets';
import { pickProps, FormItemPropsPickArray, isFunction, hasOwnProperty, defaultGetValueFromEvent } from './helper';
import { IFormSchemaMetaItem, IFormSchema, IFormSourceItem, ISchemaEventObj } from './types';
import { parseStringFunction } from './utils';

import 'antd/es/button/style/index';

const rulesRequired = (rules: ValidationRule[], element: IFormSchemaMetaItem) => {
  if (!Array.isArray(rules) || rules.length <= 0) {
    if (element.required) {
      return {
        rules: [{ required: true, message: `${element.label}不可为空` }]
      };
    }
    return { rules: [] };
  }

  if (element.required) {
    let hasRequired = false;
    const rulesTemp: ValidationRule[] = [];
    rules.forEach((item) => {
      if (hasOwnProperty(item, 'required')) {
        hasRequired = true;
      }
      rulesTemp.push(item);
    });
    if (!hasRequired) {
      rulesTemp.push({ required: true, message: `${element.label}不可为空` });
    }
    // eslint-disable-next-line no-param-reassign
    rules = rulesTemp;
  }
  return { rules };
};

const pickSource = (element: IFormSchemaMetaItem): IFormSourceItem[] => {
  const { enumLabels, enumValues } = element;
  const options = (enumValues || []).map((item, idx) => {
    const label = enumLabels && Array.isArray(enumLabels) ? enumLabels[idx] : item;
    const val = item;
    return { label, value: val };
  });
  return [...options, ...(element.source || [])];
};

// @ts-ignore
const WrapComp = React.forwardRef(({ Children, element, compProps, onChange, ...rest }, ref) => {
  const Change = (val) => {
    onChange(val);
    if (typeof compProps.onChange === 'function') {
      compProps.onChange(val);
    }
  };
  return (
    <>
      {element.beforeNode}
      <Children ref={ref} {...compProps} {...rest} onChange={Change}>
        {element.children}
      </Children>
      {element.afterNode}
    </>
  );
});

export interface IRenderElementProps {
  form: WrappedFormUtils;
  element: IFormSchemaMetaItem;
  schema: IFormSchema;
  onSearch?: (obj: ISchemaEventObj) => any;
  onFinish?: (obj: ISchemaEventObj) => any;
}
const renderElement = ({ form, element, schema, onFinish, onSearch }: IRenderElementProps): any => {
  const { getFieldDecorator } = form;
  const pickRules: { rules: ValidationRule[] } = rulesRequired(element.rules, element);
  const formItemProps = {
    ...(schema.formItemProps || {}),
    ...(element.formItemProps || {}),
    style: {
      ...(hasOwnProperty(schema, 'marginBottom') ? { marginBottom: schema.marginBottom } : {}),
      ...((schema.formItemProps || {}).style || {}),
      ...(element.style || {}),
      ...((element.formItemProps || {}).style || {})
    },
    ...pickProps(element, FormItemPropsPickArray)
  };
  // 优先使用本地传递的组件进行覆盖, 没有再查找系统自带功能
  let Comp: any;
  // element 有组件
  if (element.widget) {
    Comp = element.widget;
  } else {
    Comp = (schema.widgets || {})[element.type as string] || widgets[element.type as string];
  }

  const handleChange = usePersistFn((val) => {
    if (hasOwnProperty(element, 'onChange')) {
      let valuePropName = 'value';
      if (element.valuePropName && typeof element.valuePropName === 'string') {
        valuePropName = element.valuePropName;
      }
      const newVal = defaultGetValueFromEvent(valuePropName, val);
      if (typeof element.onChange === 'function') {
        element.onChange(newVal, { value: newVal, form, formItemProps, element, Form });
      }
      if (typeof element.onChange === 'string') {
        const onChangeFunction = parseStringFunction(element.onChange);
        const formValues = form.getFieldsValue();
        formValues[element.name as string] = newVal;
        onChangeFunction.call(formValues, { value: newVal, form, formItemProps, element, Form });
      }
    }
  });
  const renderFunction = usePersistFn(() => {
    if (element.render && isFunction(element.render)) {
      return element.render.call(element, { form, formItemProps, element, Form });
    }
    console.warn('请传入render函数');
  });
  const renderJsx = usePersistFn(() => {
    if (!Comp) {
      // console.warn('组件未渲染成功', element);
      return <></>;
    }
    let compProps: any = {
      element: {
        ...element,
        form
      },
      onChange: handleChange,
      // source: ,
      // format: element.format,
      // widgetChildProps: element.widgetChildProps,
      // disabled: schema.disabled || element.disabled,
      // readonly: schema.readonly || element.readonly,
      ...(element.widgetProps || {})
    };
    const source = pickSource(element);
    if (source.length > 0) {
      compProps.source = source;
    }
    if (hasOwnProperty(element, 'format')) {
      compProps.format = element.format;
    }
    if (hasOwnProperty(element, 'widgetChildProps')) {
      compProps.widgetChildProps = element.widgetChildProps;
    }
    if (hasOwnProperty(schema, 'disabled') || hasOwnProperty(element, 'disabled')) {
      compProps.disabled = schema.disabled || element.disabled;
    }
    // if (hasOwnProperty(schema, 'readonly') || hasOwnProperty(element, 'readonly')) {
    //   compProps.readonly = schema.readonly || element.readonly;
    // }
    // 渲染组件前处理widgetProps
    if (isFunction(element.onWidgetProps) && element.onWidgetProps) {
      const result = element.onWidgetProps(compProps, { form, element, schema });
      if (result) {
        compProps = result;
      }
    }
    const elementName = element.name || '';
    if (!elementName) {
      console.log(`name字段未传`, element);
    }
    return (
      <Form.Item {...formItemProps}>
        {(() => {
          if (element.renderReadonly) {
            const readonlyObj = { form, formItemProps, element, Form };
            let res;
            if (typeof element.renderReadonly === 'function') {
              res = element.renderReadonly(readonlyObj);
            }
            if (typeof element.renderReadonly === 'string') {
              const renderReadonlyFunction = parseStringFunction(element.renderReadonly);
              res = renderReadonlyFunction(readonlyObj);
            }
            if (res !== undefined) {
              return res;
            }
          }
          return getFieldDecorator(elementName, {
            initialValue: hasOwnProperty(element, 'initialValue') ? element.initialValue : undefined,
            rules: pickRules.rules
          })(
            // <Comp {...compProps}>{element.children}</Comp>
            // @ts-ignore
            <WrapComp element={element} compProps={compProps} Children={Comp} />
          );
        })()}
      </Form.Item>
    );
  });
  if (hasOwnProperty(element, 'onVisible')) {
    if (typeof element.onVisible === 'function') {
      if (element.onVisible({ form, formItemProps, element, Form })) {
        return renderJsx();
      }
    }
    // 兼容字符串可见函数
    if (typeof element.onVisible === 'string') {
      const onVisibleFunction = parseStringFunction(element.onVisible);
      const formValues = form.getFieldsValue();
      if (onVisibleFunction.call(formValues, { form, formItemProps, element, Form })) {
        return renderJsx();
      }
    }

    return <></>;
  }
  if (typeof element.render === 'function') {
    return renderFunction();
  }
  // 渲染按钮
  if (element.type === 'Button') {
    return (
      <Form.Item {...formItemProps}>
        <span {...(element.widgetProps || {})}>
          {(element.buttonMeta || []).map((item, index: number) => {
            const { children, btnType, render, onClick, ...rest } = item;
            if (typeof render === 'function') {
              return render.call(item, {
                form,
                buttonItem: item,
                element
              });
            }
            return (
              <React.Fragment key={index}>
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    const obj = { form, buttonItem: item, element, values: {} };
                    if (btnType === 'reset') {
                      form.resetFields();
                      if (schema.onReset && isFunction(schema.onReset)) {
                        schema.onReset(obj);
                      }
                      return;
                    }
                    if (btnType === 'search') {
                      const values = form.getFieldsValue();
                      if (onSearch) {
                        onSearch({ ...obj, values });
                        return;
                      }
                      if (schema.onSearch) {
                        schema.onSearch({ ...obj, values });
                      }
                      return;
                    }
                    if (btnType === 'submit') {
                      try {
                        const values = await form.validateFieldsAndScroll();
                        if (onFinish) {
                          onFinish({ ...obj, values });
                          return;
                        }
                        if (schema.onFinish) {
                          schema.onFinish({ ...obj, values });
                          return;
                        }
                        if (onClick) {
                          onClick(obj);
                        }
                      } catch (error) {
                        console.log(error);
                      }
                      return;
                    }
                    if (onClick) {
                      onClick(obj);
                    }
                  }}
                  {...rest}
                >
                  {children}
                </Button>
              </React.Fragment>
            );
          })}
        </span>
      </Form.Item>
    );
  }
  return renderJsx();
};

export default renderElement;
