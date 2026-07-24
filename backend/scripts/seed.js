import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Project from '../models/Project.js';
import Message from '../models/Message.js';
import Certificate from '../models/Certificate.js';
import PrivateDocument from '../models/PrivateDocument.js';
import DocumentAccess from '../models/DocumentAccess.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    const runSeed = async () => {
      await User.deleteMany();
      await Profile.deleteMany();
      await Skill.deleteMany();
      await Experience.deleteMany();
      await Project.deleteMany();
      await Message.deleteMany();
      await Certificate.deleteMany();
      await PrivateDocument.deleteMany();
      await DocumentAccess.deleteMany();

      console.log(`Database cleared for ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);

      await User.create({
        username: 'Aadhi',
        password: 'Admin786'
      });
      console.log(`Admin user seeded (Username: Aadhi, Password: Admin786) in ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);

      await Profile.create({
        name: 'Alex Mercer',
        title: 'Full Stack Engineer & UI/UX Designer',
        bio: 'Crafting responsive, high-performance web applications with modern design systems.',
        bioDetails: 'I am a Software Engineer based in San Francisco, specialized in React, Node.js, and MongoDB. I focus on creating accessible, user-centric experiences, using clean architecture and optimized front-end systems.',
        profileImage: '',
        resumeUrl: '#',
        email: 'alex.mercer@example.com',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        instagram: 'https://instagram.com',
        location: 'San Francisco, CA'
      });
      console.log(`Profile details seeded in ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);

      const skills = [
        { name: 'React / Next.js', level: 95, category: 'Frontend' },
        { name: 'JavaScript (ES6+)', level: 90, category: 'Frontend' },
        { name: 'HTML5 & CSS3', level: 95, category: 'Frontend' },
        { name: 'TypeScript', level: 85, category: 'Frontend' },
        { name: 'Node.js & Express', level: 88, category: 'Backend' },
        { name: 'REST APIs & GraphQL', level: 85, category: 'Backend' },
        { name: 'MongoDB / Mongoose', level: 85, category: 'Backend' },
        { name: 'PostgreSQL / SQL', level: 80, category: 'Backend' },
        { name: 'Git & GitHub', level: 90, category: 'Tools & DevOps' },
        { name: 'Docker', level: 75, category: 'Tools & DevOps' },
        { name: 'AWS & Cloud Deployment', level: 78, category: 'Tools & DevOps' },
        { name: 'Figma (UI/UX Design)', level: 82, category: 'Tools & DevOps' }
      ];
      await Skill.insertMany(skills);
      console.log(`Technical skills seeded in ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);

      const experiences = [
        {
          type: 'work',
          title: 'Senior Software Engineer',
          company: 'Vortex Labs',
          location: 'San Francisco, CA',
          duration: '2024 - Present',
          description: [
            'Lead frontend development of a high-traffic SaaS dashboard, increasing page load speed by 40%.',
            'Architected reusable component libraries using React and custom CSS variables, saving developers 15+ hours weekly.',
            'Mentored 4 junior engineers and introduced automated testing processes.'
          ]
        },
        {
          type: 'work',
          title: 'Full Stack Developer',
          company: 'Nexa Solutions',
          location: 'Remote',
          duration: '2022 - 2024',
          description: [
            'Built and maintained Express.js REST APIs serving over 50,000 active users.',
            'Integrated secure payment handling gateways and dynamic user authentication.',
            'Optimized database queries in MongoDB, reducing server response times by 25%.'
          ]
        },
        {
          type: 'internship',
          title: 'Software Engineering Intern',
          company: 'TechCorp Innovations',
          location: 'Boston, MA',
          duration: 'Summer 2021',
          description: [
            'Assisted in building microservices with Node.js and MongoDB.',
            'Implemented automated CI/CD unit testing pipelines.'
          ]
        },
        {
          type: 'education',
          title: 'B.S. in Computer Science',
          company: 'State University',
          location: 'Boston, MA',
          duration: '2018 - 2022',
          description: [
            'Specialized in Software Engineering and Database Architectures.',
            'Graduated with Honors, GPA: 3.8/4.0.',
            'Developed a web-based campus event manager as a senior capstone project.'
          ]
        }
      ];
      await Experience.insertMany(experiences);
      console.log(`Work, internship, and education experiences seeded in ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);

      const projects = [
        {
          title: 'Quantum Task Manager',
          description: 'A beautiful collaborative task management app with real-time updates and interactive Kanban boards.',
          longDescription: 'Quantum is a full-featured project collaboration tool. It features secure JWT user authentication, real-time board updates using WebSockets, drag-and-drop workflow task lists, and detailed activity logs. The dashboard is designed with a premium glassmorphic dark theme.',
          tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
          category: 'Full Stack',
          link: 'https://example.com/quantum',
          github: 'https://github.com/example/quantum',
          image: 'https://images.unsplash.com/photo-1540350390157-86b3509e47cd?w=600&auto=format&fit=crop&q=60',
          featured: true
        },
        {
          title: 'Aura Music Web Player',
          description: 'An elegant custom music player interface showcasing dynamic visual animations and audio controls.',
          longDescription: 'Aura is a responsive frontend client displaying high-fidelity audio controls, playlist managers, and local audio streaming. It uses Web Audio APIs for animated background waveform visualizers matching the beat frequency.',
          tags: ['React', 'HTML5 Audio', 'CSS Modules', 'Web Audio API'],
          category: 'Frontend',
          link: 'https://example.com/aura',
          github: 'https://github.com/example/aura',
          image: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=600&auto=format&fit=crop&q=60',
          featured: true
        },
        {
          title: 'API Sentinel Analytics',
          description: 'A lightweight server monitoring dashboard tracks endpoint uptime, latency, and system load.',
          longDescription: 'Sentinel Analytics runs background checks on configured HTTP/HTTPS URLs, recording historical response times, error frequencies, and server health. It provides rich REST endpoints and sends real-time system alerts.',
          tags: ['Node.js', 'Express', 'Redis', 'Chart.js', 'Cron'],
          category: 'Backend',
          link: 'https://example.com/sentinel',
          github: 'https://github.com/example/sentinel',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60',
          featured: false
        }
      ];
      await Project.insertMany(projects);
      console.log(`Portfolio projects seeded in ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);

      const certificates = [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: 'December 2025',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60',
          verificationUrl: 'https://aws.amazon.com',
          category: 'Cloud'
        },
        {
          name: 'Meta Front-End Developer Professional Certificate',
          issuer: 'Meta / Coursera',
          date: 'October 2025',
          image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60',
          verificationUrl: 'https://coursera.org',
          category: 'Frontend'
        },
        {
          name: 'MongoDB Certified Developer Associate',
          issuer: 'MongoDB University',
          date: 'August 2025',
          image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=60',
          verificationUrl: 'https://learn.mongodb.com',
          category: 'Database'
        }
      ];
      await Certificate.insertMany(certificates);
      console.log(`Certificates seeded in ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);

      const privateDocs = [
        {
          title: 'Aadhaar Card',
          category: 'Aadhaar',
          fileName: 'aadhaar.png',
          fileType: 'image/png',
          fileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        {
          title: 'PAN Card',
          category: 'PAN',
          fileName: 'pan.png',
          fileType: 'image/png',
          fileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        {
          title: 'Passport Copy',
          category: 'Passport',
          fileName: 'passport.pdf',
          fileType: 'application/pdf',
          fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCg=='
        }
      ];
      await PrivateDocument.insertMany(privateDocs);
      console.log(`Private documents seeded in ${global.useJsonDb ? 'JSON DB' : 'MongoDB'}.`);
    };

    console.log('Seeding primary database...');
    await runSeed();

    // If we seeded MongoDB, let's also seed the JSON fallback database
    if (global.useJsonDb === false) {
      console.log('Also seeding JSON fallback database...');
      global.useJsonDb = true;
      await runSeed();
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
