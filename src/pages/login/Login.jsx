import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Checkbox, message } from 'antd';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../common/redux/authSlice';
import { useNavigate } from 'react-router-dom';
const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const URL = import.meta.env.VITE_API_URL + '/api/auth/login';

  const onFinish = async ({ email, password }) => {
     try {
        const res = await axios.post(URL, { email, password }, { withCredentials: true });
        dispatch(loginSuccess({
          user: res.data.user,
          token: res.data.token,
        }));
       message.success('Đăng nhập thành công!');

    } catch (error) {
      const errMsg = error.response?.data?.message || 'Đăng nhập thất bại!';
      message.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6">
      <div className="flex flex-col items-center mb-6">
        {/* Hàng chứa logo + title */}
        <div className="flex items-center mb-2">
            <img src='/logo.png' alt="TTCS CAFFE" className="h-16 mr-4" />
            <Title level={3} className="mb-0">   Đăng nhập </Title>
        </div>
        {/* Dòng phụ text */}
        <Text type="secondary">Đăng nhập vào TTCS CAFFE</Text>
        </div>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input size="large" placeholder="your@email.com" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              className="text-lg"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
