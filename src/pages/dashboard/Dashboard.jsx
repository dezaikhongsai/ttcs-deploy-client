import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Select, Space, Typography, Card, Row, Col, DatePicker, message } from 'antd';
import { CheckCircleOutlined, CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getWorkSchedule, getShifts, getEmployeeWithPosition , createTimeSheet, updateTimeSheet } from './services/dashboard.service';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
dayjs.extend(weekday);

const { Title, Text } = Typography;

// Hàm helper để lấy thông tin timesheet từ localStorage
const getStoredTimesheet = () => {
  const storedData = localStorage.getItem('currentTimesheet');
  console.log('Stored timesheet data:', storedData); // Log dữ liệu từ localStorage
  if (!storedData) return null;
  return JSON.parse(storedData);
};

const Dashboard = () => {
  const employee = useSelector((state) => state.auth.user?.employeeId);
  const [viewMode, setViewMode] = useState('attendance'); // 'attendance' or 'schedule'
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workSchedules, setWorkSchedules] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week').add(1, 'day'));
  const [filterType, setFilterType] = useState('day'); // 'day' | 'week' | 'month'
  const [filterValue, setFilterValue] = useState(dayjs());
  const [selectedWorkSchedule, setSelectedWorkSchedule] = useState(null);
  // const [timesheet , setTimesheet] = useState(null);
  const [timeCheckIn , setTimeCheckIn] = useState("");
  const [timesheetId , setTimesheetId] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Load timesheet data from localStorage on component mount
  useEffect(() => {
    const storedTimesheet = getStoredTimesheet();
    console.log('Loading timesheet from localStorage:', storedTimesheet); // Log khi load dữ liệu
    if (storedTimesheet && storedTimesheet.employeeId === (employee?._id || employee)) {
      const today = dayjs().format('YYYY-MM-DD');
      const storedDate = dayjs(storedTimesheet.day).format('YYYY-MM-DD');
      console.log('Today:', today, 'Stored date:', storedDate); // Log để so sánh ngày
      
      // Chỉ khôi phục timesheet nếu là cùng ngày
      if (today === storedDate) {
        setSelectedWorkSchedule(storedTimesheet.workScheduleId);
        setTimeCheckIn(storedTimesheet.checkIn);
        setTimesheetId(storedTimesheet.timesheetId);
        setIsCheckedIn(true);
        console.log('Restored timesheet state:', {
          workScheduleId: storedTimesheet.workScheduleId,
          checkIn: storedTimesheet.checkIn,
          timesheetId: storedTimesheet.timesheetId
        }); // Log state đã được khôi phục
      } else {
        console.log('Removing old timesheet data'); // Log khi xóa dữ liệu cũ
        localStorage.removeItem('currentTimesheet');
      }
    }
  }, [employee]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch work schedules
  useEffect(() => {
    const fetchWorkSchedules = async () => {
      try {
        const data = await getWorkSchedule();
        setWorkSchedules(data);
      } catch (error) {
        console.error('Error fetching work schedules:', error);
      }
    };
    fetchWorkSchedules();
  }, []);

  // Fetch shifts & employees for schedule view
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shiftsData, employeesData] = await Promise.all([
          getShifts(),
          getEmployeeWithPosition()
        ]);
        setShifts(shiftsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching shifts or employees:', error);
      }
    };
    if (viewMode === 'schedule') {
      fetchData();
    }
  }, [viewMode]);

  // Khi đổi filterType hoặc filterValue, cập nhật selectedDate và weekStart
  useEffect(() => {
    if (filterType === 'day') {
      setSelectedDate(filterValue);
      setWeekStart(filterValue.startOf('week').add(1, 'day'));
    } else if (filterType === 'week') {
      setWeekStart(filterValue.startOf('week').add(1, 'day'));
      setSelectedDate(filterValue.startOf('week').add(1, 'day'));
    } else if (filterType === 'month') {
      setWeekStart(filterValue.startOf('month').startOf('week').add(1, 'day'));
      setSelectedDate(filterValue.startOf('month').startOf('week').add(1, 'day'));
    }
  }, [filterType, filterValue]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 10) return 'sáng';
    if (hour < 13) return 'trưa';
    if (hour < 18) return 'chiều';
    return 'tối';
  };

const handleCheckIn = async () => {
  if (!selectedWorkSchedule) return;
  const day = dayjs().utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[+00:00]');
  const timeSheet = {
    employeeId: employee?._id || employee,
    day: day,
    workScheduleId: selectedWorkSchedule,
    checkIn: dayjs(new Date()).format('HH:mm'),
    checkOut: '',
    status: "Đang làm việc",
  };

  try {
    console.log('Sending check-in request:', timeSheet);
    const res = await createTimeSheet(timeSheet);
    if (res.success === true) {
      // Lưu thông tin timesheet vào localStorage
      const timesheetData = {
        employeeId: res.data.employeeId,
        workScheduleId: res.data.workScheduleId,
        checkIn: res.data.checkIn,
        timesheetId: res.data._id,
        day: res.data.day
      };
      console.log('Saving timesheet to localStorage:', timesheetData);
      localStorage.setItem('currentTimesheet', JSON.stringify(timesheetData));

      // Verify data was saved
      const savedData = localStorage.getItem('currentTimesheet');
      console.log('Verified saved data:', savedData);

      setTimeCheckIn(res.data.checkIn);
      setTimesheetId(res.data._id);
      setIsCheckedIn(true);
      message.success(res.message || "Chấm công thành công!");
    } else {
      console.error('Check-in failed:', res.message);
      message.error(res.message || "Chấm công thất bại!");
    }
  } catch (error) {
    console.error('Check-in error:', error);
    message.error("Có lỗi xảy ra khi chấm công!");
  }
};
  const handleCheckOut = async () => {
    const day = dayjs().utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[+00:00]');
    if (!selectedWorkSchedule) return;

    const checkoutData = {
      employeeId: employee?._id || employee,
      day: day,
      workScheduleId: selectedWorkSchedule,
      checkIn: timeCheckIn,
      checkOut: dayjs(new Date()).format('HH:mm'),
      status: "Đã hoàn thành",
    };

    try {
      console.log('Sending check-out request:', checkoutData); // Log request check-out
      const res = await updateTimeSheet(timesheetId, checkoutData);
      if (res) {
        console.log('Removing timesheet from localStorage'); // Log trước khi xóa
        localStorage.removeItem('currentTimesheet');
        
        // Verify data was removed
        const remainingData = localStorage.getItem('currentTimesheet');
        console.log('Verified localStorage after removal:', remainingData); // Log để kiểm tra sau khi xóa

        setIsCheckedIn(false);
        setTimeCheckIn("");
        setTimesheetId("");
        message.success("Đã checkout thành công!");
      } else {
        console.error('Check-out failed:', res.message); // Log lỗi nếu có
        message.error(res.message || "Checkout thất bại!");
      }
    } catch (error) {
      console.error('Check-out error:', error); // Log lỗi exception
      message.error("Có lỗi xảy ra khi checkout!");
    }
  };

  // Helper: get 7 days of current week
  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  };

  // Helper: lấy shifts của ngày được chọn
  const getShiftsBySelectedDate = (date) => {
    const formatted = date.format('YYYY-MM-DD');
    const dayObj = shifts.find(item => dayjs(item.day).format('YYYY-MM-DD') === formatted);
    if (!dayObj || !Array.isArray(dayObj.shifts)) return [];
    return dayObj.shifts;
  };

  // Helper: group shifts by workSchedule name
  const groupShiftsByWorkSchedule = (shiftsArr) => {
    const grouped = {};
    shiftsArr.forEach(shift => {
      const wsName = shift.workSchedule?.name || shift.workSchedule?.workSchedule || 'Chưa rõ';
      if (!grouped[wsName]) grouped[wsName] = [];
      grouped[wsName].push(shift);
    });
    return grouped;
  };

  // Helper: get color for position
  const getPositionColor = (position) => {
    switch (position) {
      case 'Admin': return 'red';
      case 'Quản lý': return 'blue';
      case 'Thu ngân': return 'green';
      case 'Pha chế': return 'orange';
      case 'Phục vụ': return 'purple';
      default: return 'gray';
    }
  };

  // Week navigation
  const handlePrevWeek = () => {
    setWeekStart(weekStart.subtract(7, 'day'));
    setSelectedDate(weekStart.subtract(7, 'day'));
  };
  const handleNextWeek = () => {
    setWeekStart(weekStart.add(7, 'day'));
    setSelectedDate(weekStart.add(7, 'day'));
  };

  // Helper: map employee info for each shift
  const enrichShiftEmployees = (shift) => {
    if (!shift.employees || shift.employees.length === 0) return [];
    return shift.employees.map(emp => {
      // Nếu emp đã có name, trả về luôn
      if (emp.name) return emp;
      // Nếu emp.employee là object
      if (emp.employee && typeof emp.employee === 'object') {
        return {
          ...emp,
          name: emp.employee.name || 'Không rõ',
          position: emp.employee.position || emp.roleInShift || 'Không rõ',
        };
      }
      // Nếu emp.employee là id hoặc emp._id/emp.employeeId
      const id = emp.employee || emp._id || emp.employeeId;
      const found = employees.find(e => e._id === id);
      return {
        ...emp,
        name: found?.name || 'Không rõ',
        position: found?.position || emp.roleInShift || 'Không rõ',
      };
    });
  };

  return (
    <div className="p-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="flex justify-between items-center">
          <Space>
            <Button
              type={viewMode === 'attendance' ? 'primary' : 'default'}
              onClick={() => setViewMode('attendance')}
              icon={<CheckCircleOutlined />}
            >
              Chấm công
            </Button>
            <Button
              type={viewMode === 'schedule' ? 'primary' : 'default'}
              onClick={() => setViewMode('schedule')}
              icon={<CalendarOutlined />}
            >
              Lịch làm
            </Button>
          </Space>
        </div>

        {viewMode === 'attendance' ? (
          <Card>
            <div className="text-left mb-4">
              <Title level={4}>Xin chào buổi {getGreeting()}, {employee?.name}</Title>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-4xl font-bold">
                {currentTime.toLocaleTimeString()}
              </div>
              <Space direction="vertical" align="center" size="large">
                <Select
                  style={{ width: 200 }}
                  placeholder="Chọn ca làm"
                  value={selectedWorkSchedule}
                  onChange={setSelectedWorkSchedule}
                  disabled={isCheckedIn}
                >
                  {workSchedules.map((schedule) => (
                    <Select.Option key={schedule._id} value={schedule._id}>
                      {`${schedule.workSchedule} (${schedule.timeStart} - ${schedule.timeEnd})`}
                    </Select.Option>
                  ))}
                </Select>
                <Space>
                  {!isCheckedIn ? (
                    <Button type="primary" onClick={handleCheckIn} disabled={!selectedWorkSchedule}>
                      Check-in
                    </Button>
                  ) : (
                    <Button type="primary" danger onClick={handleCheckOut}>
                      Check-out
                    </Button>
                  )}
                </Space>
                {isCheckedIn && (
                  <Text type="success">
                    Đã check-in lúc: {timeCheckIn}
                  </Text>
                )}
              </Space>
            </div>
          </Card>
        ) : (
          <Card bodyStyle={{ background: '#fff', padding: 24, borderRadius: 16 }} style={{ background: '#fff', borderRadius: 16 }}>
            {/* Bộ lọc ngày/tuần/tháng và DatePicker */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12, justifyContent: 'center' }}>
              <Select value={filterType} onChange={val => setFilterType(val)} style={{ width: 120 }}>
                <Select.Option value="day">Ngày</Select.Option>
                <Select.Option value="week">Tuần</Select.Option>
                <Select.Option value="month">Tháng</Select.Option>
              </Select>
              <DatePicker
                picker={filterType}
                value={filterValue}
                onChange={val => setFilterValue(val || dayjs())}
                format={filterType === 'month' ? 'MM/YYYY' : 'DD/MM/YYYY'}
                allowClear={false}
                style={{ width: 160 }}
              />
            </div>
            {/* Thanh chọn ngày ngang */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, justifyContent: 'center', gap: 8 }}>
              <Button icon={<LeftOutlined />} onClick={handlePrevWeek} style={{ background: '#f5f5f5', color: '#222', border: 'none' }} />
              <div style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: 8, maxWidth: 900 }}>
                {getWeekDays().map((date) => (
                  <div
                    key={date.format('YYYY-MM-DD')}
                    style={{
                      padding: '12px 0',
                      width: 110,
                      borderRadius: 12,
                      background: date.isSame(selectedDate, 'day') ? '#e6f7ff' : '#f5f5f5',
                      color: date.isSame(selectedDate, 'day') ? '#1890ff' : '#222',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: date.isSame(selectedDate, 'day') ? '2px solid #1890ff' : 'none',
                      fontWeight: date.isSame(selectedDate, 'day') ? 700 : 400,
                      fontSize: 17,
                      boxShadow: date.isSame(selectedDate, 'day') ? '0 2px 8px #1890ff40' : 'none',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div>{date.format('DD/MM')}</div>
                    <div style={{ fontSize: 18 }}>{['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'][date.day() === 0 ? 6 : date.day() - 1]}</div>
                  </div>
                ))}
              </div>
              <Button icon={<RightOutlined />} onClick={handleNextWeek} style={{ background: '#f5f5f5', color: '#222', border: 'none' }} />
            </div>
            {/* Danh sách ca làm theo ngày */}
            <div>
              {getShiftsBySelectedDate(selectedDate).length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>Không có ca làm nào cho ngày này.</div>
              ) : (
                <Row gutter={[16, 16]}>
                  {Object.entries(groupShiftsByWorkSchedule(getShiftsBySelectedDate(selectedDate))).map(([workSchedule, shiftsInSchedule], idx) => (
                    <Col xs={24} md={12} key={idx}>
                      <Card
                        title={<span style={{ fontWeight: 600, color: '#222' }}>{workSchedule}</span>}
                        style={{ marginBottom: 16, borderRadius: 16, background: '#fff', color: '#222', boxShadow: '0 2px 8px #0001' }}
                        headStyle={{ background: '#fff', color: '#222', borderRadius: 16, fontSize: 18 }}
                        bodyStyle={{ background: '#fff', color: '#222' }}
                      >
                        {shiftsInSchedule.map((shift, i) => (
                          <div key={i} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>
                              Bắt đầu: {shift.workSchedule?.timeStart || shift.timeStart || ''} | Kết thúc: {shift.workSchedule?.timeEnd || shift.timeEnd || ''}
                            </div>
                            {enrichShiftEmployees(shift).length > 0 && (
                              <ul style={{ paddingLeft: 16, margin: '8px 0' }}>
                                {enrichShiftEmployees(shift).map((emp, j) => (
                                  <li key={j} style={{ color: '#222', marginBottom: 2, fontSize: 15 }}>
                                    {emp.name} - <span style={{ color: getPositionColor(emp.position), fontWeight: 500 }}>{emp.position}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default Dashboard;