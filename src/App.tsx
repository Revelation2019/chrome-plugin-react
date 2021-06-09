import React from 'react';
import styles from './App.module.css';
import { Button, Form, Input } from 'antd';
declare const chrome: any;

interface ICookie {
  name: string;
  value: string;
  path: string;
  secure: string
  domain: string;
  hostOnly: boolean;
  httpOnly: boolean;
  expirationDate: number;
  storeId: string;
  session: boolean;
}

interface ITab {
  id:number;
  index:number;
  windowId:number;
  selected:boolean;
  pinned:boolean;
  url:string;
  title:string;
  favIconUrl:string;
  status:string;
  incognito:boolean;
}

function App() {

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  /** 重定向 */
  const redirectTo = (url: string) => {
    window.open(url);
  }

  /** 获取地址栏 */
  const getUrl = (): Promise<ITab> => {
    return new Promise((resolve) => {
      chrome.tabs.getSelected(null, resolve)
    })
  }

  /** 获取Cookie */
  const getCookie = (url: string): Promise<ICookie[]> => {
    return new Promise(async (resolve) => {
      chrome.cookies.getAll({ url }, resolve)
    })
  }

  /** 设置Cookie */
  const setCookie = (cookies: ICookie[], redirect_url: string) => {
    return new Promise<void>(async (resolve) => {
      cookies.forEach((cookie) => {
        const { name, value, path, secure, expirationDate, storeId } = cookie;
        chrome.cookies.set({ url: redirect_url, name, value, path, secure, expirationDate, storeId, domain: 'localhost' });
      })
      resolve();
    })
  }

  /** 表单验证通过后的回调 */
  const onFinish = async (values: any) => {
    const { url } = values;
    if (!url) alert('Please input your debug url!');
    const tab = await getUrl();
    const cookies = await getCookie(tab.url);
    setCookie(cookies, url).then(() => redirectTo(url));
  }

  return (
    <div className={styles.container}>
      <Form
        {...layout}
        name="basic"
        onFinish={onFinish}
        className={styles.form}
      >
        <Form.Item
          label="调试地址"
          name="url"
          rules={[{ pattern: /^https?:\/\/*\/*/, message: 'Please input your validable url!' }]}
        >
          <Input placeholder="Please input your debug url!" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">调试</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default App;
