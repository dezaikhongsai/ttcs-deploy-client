import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const { Title } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1'];

const QuickStatistics = ({ statistics }) => {
  // Chuyển đổi dữ liệu cho biểu đồ tròn giới tính
  const genderData = statistics?.genderStatistics ? [
    { name: 'Nam', value: parseInt(statistics.genderStatistics.male.count) },
    { name: 'Nữ', value: parseInt(statistics.genderStatistics.female.count) }
  ] : [];

  // Chuyển đổi dữ liệu cho biểu đồ tròn vị trí
  const positionData = statistics?.positionStatistics?.map(stat => ({
    name: stat.position,
    value: stat.count
  })) || [];

  return (
    <div className="mb-6">      
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card hoverable className="h-full">
            <Statistic
              title="Tổng số nhân viên"
              value={statistics?.totalEmployees}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable className="h-full">
            <Statistic
              title="Nam"
              value={statistics?.genderStatistics?.male?.count}
              suffix={`(${statistics?.genderStatistics?.male?.ratio})`}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable className="h-full">
            <Statistic
              title="Nữ"
              value={statistics?.genderStatistics?.female?.count}
              suffix={`(${statistics?.genderStatistics?.female?.ratio})`}
              prefix={<UserOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ phân bố */}
      <Row gutter={[16, 16]}>
        {/* Biểu đồ phân bố giới tính */}
        <Col xs={24} md={12}>
          <Card title="Phân bố giới tính" hoverable className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Biểu đồ phân bố vị trí */}
        <Col xs={24} md={12}>
          <Card title="Phân bố vị trí" hoverable className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {positionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Thống kê lương */}
      <Row gutter={[16, 16]} className="mt-4">
        {statistics?.salaryStatistics?.byGender?.map((stat) => (
          <Col xs={24} md={12} key={stat.gender}>
            <Card title={`Thống kê lương - ${stat.gender}`} hoverable className="h-full">
              <Statistic
                title="Lương trung bình"
                value={stat.averageSalary}
                prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                suffix="VND/giờ"
                valueStyle={{ color: '#faad14' }}
              />
              <div className="mt-4">
                <p className="text-gray-600">Lương thấp nhất: {stat.minSalary} VND/giờ</p>
                <p className="text-gray-600">Lương cao nhất: {stat.maxSalary} VND/giờ</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default QuickStatistics; 