import { prisma } from './prisma.js';
import bcrypt from 'bcrypt';

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Vikram', 'Neha', 'Karan', 'Pooja',
  'Rahul', 'Divya', 'Siddharth', 'Kavya', 'Varun', 'Riya', 'Akash', 'Isha', 'Yash', 'Meera',
  'Amit', 'Shruti', 'Nikhil', 'Tanvi', 'Manish', 'Shreya', 'Deepak', 'Swati', 'Gaurav', 'Anushka',
  'Tarun', 'Simran', 'Abhishek', 'Bhavna', 'Harsh', 'Radhika', 'Kartik', 'Kriti', 'Mayank', 'Richa',
  'Pranav', 'Nidhi', 'Sachin', 'Sonam', 'Vishal', 'Payal', 'Alok', 'Ritu', 'Kunal', 'Jyoti'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Joshi', 'Reddy', 'Nair', 'Iyer',
  'Mehta', 'Shah', 'Rao', 'Das', 'Roy', 'Chowdhury', 'Malhotra', 'Kapoor', 'Bhat', 'Agarwal'
];

async function main() {
  console.log('🚀 Seeding 100+ Students across 6 Departments with Past 30 Days Attendance History...');

  // Create Roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'SuperAdmin' }, update: {}, create: { name: 'SuperAdmin' } }),
    prisma.role.upsert({ where: { name: 'CollegeAdmin' }, update: {}, create: { name: 'CollegeAdmin' } }),
    prisma.role.upsert({ where: { name: 'Student' }, update: {}, create: { name: 'Student' } }),
  ]);

  const superAdminRole = roles[0];
  const studentRole = roles[2];

  // Clean old attendance and student user records
  await prisma.attendance.deleteMany({});
  await prisma.locationEvent.deleteMany({});
  await prisma.user.deleteMany({
    where: { roleId: studentRole.id }
  });

  // Create Super Admin User
  const adminHashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@college.edu' },
    update: {},
    create: {
      email: 'admin@college.edu',
      password: adminHashedPassword,
      name: 'System Admin',
      roleId: superAdminRole.id,
      adminProfile: { create: {} }
    }
  });

  // Create 6 Departments & Courses
  const deptData = [
    { name: 'Computer Science', courses: ['B.Tech CSE', 'M.Tech CSE'] },
    { name: 'Artificial Intelligence', courses: ['B.Tech AI & DS', 'B.Tech Machine Learning'] },
    { name: 'Electronics & Communication', courses: ['B.Tech ECE', 'B.Tech VLSI Design'] },
    { name: 'Information Technology', courses: ['B.Tech IT'] },
    { name: 'Mechanical Engineering', courses: ['B.Tech ME'] },
    { name: 'Civil Engineering', courses: ['B.Tech CE'] },
  ];

  const createdDepts: any[] = [];
  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: { name: d.name }
    });

    const courses: any[] = [];
    for (const cName of d.courses) {
      const course = await prisma.course.findFirst({ where: { name: cName } }) ||
        await prisma.course.create({ data: { name: cName, departmentId: dept.id } });
      courses.push(course);
    }

    createdDepts.push({ dept, courses });
  }

  const baseLat = 12.9337;
  const baseLng = 77.6051;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Seed 100 Students
  for (let i = 1; i <= 100; i++) {
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor((i - 1) / 5) % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const email = `student${i}@gmail.com`;
    const rawPass = `student${i.toString().padStart(3, '0')}`;
    const studentHashedPassword = await bcrypt.hash(rawPass, 10);

    const deptGroup = createdDepts[(i - 1) % createdDepts.length];
    const department = deptGroup.dept;
    const course = deptGroup.courses[(i - 1) % deptGroup.courses.length];

    const year = ((i - 1) % 4) + 1;
    const prefix = department.name.substring(0, 3).toUpperCase();
    const rollNumber = `${prefix}202${4 - year}${i.toString().padStart(3, '0')}`;

    const user = await prisma.user.create({
      data: {
        email,
        password: studentHashedPassword,
        name,
        roleId: studentRole.id,
        studentProfile: {
          create: {
            rollNumber,
            departmentId: department.id,
            courseId: course.id,
            year,
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const studentId = user.studentProfile!.id;

    // Distribute Coordinates around campus
    const isInsideCampus = i % 5 !== 0;
    const latOffset = ((i % 10) - 5) * 0.0008;
    const lngOffset = (Math.floor(i / 10) - 5) * 0.0008;

    const lat = isInsideCampus ? baseLat + latOffset : baseLat - 0.0150 + latOffset;
    const lng = isInsideCampus ? baseLng + lngOffset : baseLng - 0.0150 + lngOffset;

    // Seed Location Event
    await prisma.locationEvent.create({
      data: {
        studentId,
        latitude: lat,
        longitude: lng,
        accuracy: 3.5,
        speed: 0,
        batteryLevel: 65 + (i % 30),
        deviceModel: i % 2 === 0 ? 'iPhone 15 Pro' : 'MacBook Pro M1',
        osVersion: i % 2 === 0 ? 'iOS 17.4' : 'macOS 14 Sonoma',
        networkType: 'WiFi 5G',
        gpsEnabled: true,
        timestamp: new Date(),
      }
    });

    // Seed Past 30 Days Attendance History up to TODAY (No Future Dates!)
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // 85% Present, 15% Absent
      const isAbsentDay = (i + dayOffset) % 7 === 0;
      const status = isAbsentDay ? 'Absent' : 'Present';

      const checkInHour = 8 + ((i + dayOffset) % 2);
      const checkInMinute = (i * 7 + dayOffset * 3) % 60;
      const checkInDate = new Date(date);
      checkInDate.setHours(checkInHour, checkInMinute, 0);

      const checkOutHour = 16 + ((i + dayOffset) % 2);
      const checkOutMinute = (i * 11 + dayOffset * 5) % 60;
      const checkOutDate = new Date(date);
      checkOutDate.setHours(checkOutHour, checkOutMinute, 0);

      const durationMinutes = isAbsentDay ? 0 : Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60));

      await prisma.attendance.create({
        data: {
          studentId,
          date,
          checkIn: isAbsentDay ? null : checkInDate,
          checkOut: isAbsentDay ? null : checkOutDate,
          status,
          duration: durationMinutes,
        }
      });
    }
  }

  console.log('✅ Clean database seed completed! 100 Students created with Past 30 Days historical records up to Today (No future dates)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
