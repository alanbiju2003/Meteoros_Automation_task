import { prisma } from './prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database with 14 days of multi-day class schedules & attendance history...');

  // Create Roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'SuperAdmin' }, update: {}, create: { name: 'SuperAdmin' } }),
    prisma.role.upsert({ where: { name: 'CollegeAdmin' }, update: {}, create: { name: 'CollegeAdmin' } }),
    prisma.role.upsert({ where: { name: 'Student' }, update: {}, create: { name: 'Student' } }),
  ]);

  const superAdminRole = roles[0];
  const studentRole = roles[2];

  // Clean old student records first
  await prisma.user.deleteMany({
    where: {
      roleId: studentRole.id
    }
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
      adminProfile: {
        create: {}
      }
    }
  });

  // Create Departments & Courses
  const cseDept = await prisma.department.upsert({
    where: { name: 'Computer Science' },
    update: {},
    create: {
      name: 'Computer Science',
      courses: {
        create: [
          { name: 'B.Tech CSE' },
          { name: 'M.Tech CSE' }
        ]
      }
    }
  });

  const btechCse = await prisma.course.findFirst({ where: { name: 'B.Tech CSE' } });

  // Exact Campus Coordinates: Lat 12.9337, Lng 77.6051
  const baseLat = 12.9337;
  const baseLng = 77.6051;

  // Seed 50 Students with credentials (student1@gmail.com / student001 ... student50@gmail.com / student050)
  for (let i = 1; i <= 50; i++) {
    const email = `student${i}@gmail.com`;
    const rawPass = `student${i.toString().padStart(3, '0')}`;
    const studentHashedPassword = await bcrypt.hash(rawPass, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: studentHashedPassword,
        name: `Student ${i}`,
        roleId: studentRole.id,
        studentProfile: {
          create: {
            rollNumber: `CSE2023${i.toString().padStart(3, '0')}`,
            departmentId: cseDept.id,
            courseId: btechCse!.id,
            year: 2,
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const studentId = user.studentProfile!.id;

    // Distribute Mayur Vihar / Campus coordinates
    const isInsideCampus = i % 4 !== 0;
    const latOffset = ((i % 8) - 4) * 0.0008;
    const lngOffset = (Math.floor(i / 8) - 3) * 0.0008;

    const lat = isInsideCampus ? baseLat + latOffset : baseLat - 0.0120 + latOffset;
    const lng = isInsideCampus ? baseLng + lngOffset : baseLng - 0.0120 + lngOffset;

    // Seed TimescaleDB LocationEvent
    await prisma.locationEvent.create({
      data: {
        studentId,
        latitude: lat,
        longitude: lng,
        accuracy: 3.5,
        speed: 0.2,
        batteryLevel: 65 + (i % 30),
        networkType: 'WiFi 5G',
        gpsEnabled: true,
        timestamp: new Date()
      }
    });

    // Seed Past 14 Days of Attendance Records in PostgreSQL
    for (let d = 0; d < 14; d++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - d);
      pastDate.setHours(0, 0, 0, 0);

      // Randomize attendance status for realistic historical data
      const isPresent = (i + d) % 5 !== 0;
      const checkInTime = new Date(pastDate);
      checkInTime.setHours(9, 5 + (i % 15), 0);

      const checkOutTime = new Date(pastDate);
      checkOutTime.setHours(17, 0, 0);

      await prisma.attendance.create({
        data: {
          studentId,
          date: pastDate,
          checkIn: isPresent ? checkInTime : null,
          checkOut: isPresent ? checkOutTime : null,
          status: isPresent ? 'Present' : 'Absent',
          duration: isPresent ? 475 : 0
        }
      });
    }
  }

  console.log('Seeding complete! 14 days of multi-day class attendance records generated for 50 students!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
