import React, { useMemo, useRef, useCallback } from 'react';
import { Button } from 'antd';
import { FormRenderModal, IFormSchema } from '@tms/site-component';

export default () => {
  const modalRef = useRef<any>(null);
  const schema: IFormSchema = useMemo(
    () => ({
      meta: [
        {
          type: 'Input',
          name: 'userName',
          label: '用户名',
          required: true
        }
      ]
    }),
    []
  );
  const modalOptions = useRef({
    title: '标题',
    onOk() {
      console.log(modalRef);
      const values = modalRef.current.form.getFieldsValue();
      console.log('values22', values);
    }
  }).current;
  const onClickComp = useCallback(() => {
    console.log(modalRef.current);
    modalRef.current.show({ schema });
  }, []);

  return (
    <>
      <Button onClick={onClickComp}>打开弹框(组件用法)</Button>
      <FormRenderModal ref={modalRef} options={modalOptions} />
    </>
  );
};
