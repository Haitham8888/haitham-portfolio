// Simple Projects Slider Logic
const projects = [
    {
        img: "img/Sanka.png",
        title: "SANKA BOT",
        desc: "A Telegram Chat-Bot using Chat-GPT3 API. Helps users interact with AI directly on Telegram for quick answers and productivity.",
        link: "https://t.me/Sanka_Tbot"
    },
    {
        img: "img/Yusr.png",
        title: "YUSR APP",
        desc: "Yusr is a mobile app that digitizes traditional debt recording for small businesses, enabling secure and private delayed payments through a digital card. It promotes transparency, trust, and financial literacy with features for savings, investment, and community funds.\nSkills: Project Management, ERP, Financial Tech, Solution Architecture.",
        link: "https://github.com/Haitham8888/Yusr"
    },
    {
        img: "img/MNHAL.png",
        title: "MNHAL",
        desc: "MNHAL is an IoT-based system for monitoring beehive health using smart sensors and real-time data analysis. It helps beekeepers track temperature, humidity, and hive activity for optimal conditions and early issue detection.\nSkills: Internet of Things (IoT).",
        link: "https://github.com/Haitham8888/Mn7al"
    },
    {
        img: "img/MNBET.png",
        title: "MNBET APP",
        desc: "An AI-powered app that detects coffee plant diseases and pests through image recognition. It helps farmers identify issues early to improve crop health and boost coffee quality.\nSkills: Artificial Intelligence (AI), Computer Vision.",
        link: "https://github.com/Haitham8888/MNBET"
    },
    {
        img: "img/Waselani.png",
        title: "WASELANI APP",
        desc: "Online Taxi Ordering App. Enables users to book rides easily and securely, supporting local drivers and providing a seamless transportation experience.",
        link: "https://github.com/Haitham8888/Waselani"
    },
    {
        img: "img/Taawun.png",
        title: "TAAWUN APP",
        desc: "Taawun is an AI-driven platform for universities to manage courses, bootcamps, and hackathons. It helps students by simplifying study materials, generating summaries, and creating quizzes using AI.\nSkills: Education, Artificial Intelligence.",
        link: "https://github.com/Haitham8888/Taawoun"
    },
    {
        img: "img/شعار_جامعة_جازان.svg.png",
        title: "EDUGATE PORTAL",
        desc: "Edugate Portal - Jazan University is a website that allows students to access academic services like registration, grades, and schedules. Built with HTML, CSS, JavaScript, PHP, and MySQL.\nSkills: JavaScript, HTML, CSS, Web Development.",
        link: "https://edugate.jazanu.edu.sa/"
    }
];

let current = 1; // Start with Yusr App in center

function renderProjects() {
    const left = (current + projects.length - 1) % projects.length;
    const right = (current + 1) % projects.length;

    document.querySelector('.project-left img').src = projects[left].img;
    document.querySelector('.project-left img').alt = projects[left].title;
    document.querySelector('.project-left .project-title').textContent = projects[left].title;

    document.querySelector('.project-center img').src = projects[current].img;
    document.querySelector('.project-center img').alt = projects[current].title;
    document.querySelector('.project-center .project-title').textContent = projects[current].title;

    document.querySelector('.project-right img').src = projects[right].img;
    document.querySelector('.project-right img').alt = projects[right].title;
    document.querySelector('.project-right .project-title').textContent = projects[right].title;

    document.querySelector('.project-description strong').textContent = projects[current].title;
    document.querySelector('.project-description p').textContent = projects[current].desc;

    // اجعل المشروع في المنتصف قابل للنقر ويفتح الرابط في نافذة جديدة
    const centerProject = document.querySelector('.project-center');
    centerProject.style.cursor = 'pointer';
    centerProject.onclick = function() {
        if (projects[current].link && projects[current].link !== '#') {
            window.open(projects[current].link, '_blank');
        }
    };
}

document.querySelector('.slider-arrow.left').onclick = function() {
    current = (current + projects.length - 1) % projects.length;
    renderProjects();
};
document.querySelector('.slider-arrow.right').onclick = function() {
    current = (current + 1) % projects.length;
    renderProjects();
};

renderProjects();

// Honors & Awards Slider Logic
const honors = [
    {
        icon: "🥉",
        title: "3rd Place – Accounting Hackathon",
        meta: "King Saud University · Dec 2024",
        desc: "Achieved third place at the Accounting Hackathon hosted by King Saud University in collaboration with the Saudi Accounting Association. The project presented a smart financial solution aimed at enhancing accounting accuracy, automating processes, and supporting digital transformation in the financial sector.",
        img: "img/Accounting Hackathon.jpeg"
    },
    {
        icon: "🥉",
        title: "3rd Place – Jaddathon Hackathon",
        meta: "Jada30 | جادة30 · Dec 2024",
        desc: "Won third place at Jaddathon 2024 with MNHAL, a smart beehive monitoring system powered by IoT. The project enables beekeepers to track hive health in real time using sensors that measure temperature, humidity, and activity—supporting sustainable honey production and early issue detection.",
        img: "img/Jaddathon Hackathon.jpeg"
    },
    {
        icon: "🥇",
        title: "Winner – Bank Albilad Hackathon 2024",
        meta: "بنك البلاد | Bank Albilad · Oct 2024",
        desc: "Our team won 2nd place at the Bank Albilad Hackathon 2024 for developing an innovative fintech solution that promotes financial literacy and enables smart debt management for individuals and small businesses. The project focused on digital transformation, transparency, and empowering users through secure, AI-driven tools.",
        img: "img/Bank Albilad Hackathon.jpg"
    },
    {
        icon: "🥇",
        title: "1st Place – Monsha'at Hackathon 2024",
        meta: "Monsha'at | منشآت · Oct 2024",
        desc: "Achieved first place at the Monsha'at Hackathon 2024 by developing a smart solution that supports entrepreneurs and enhances business operations through AI and digital tools. The project focused on solving real-world challenges for SMEs, promoting innovation, and enabling smarter decision-making in the startup ecosystem.",
        img: "img/Monsha'at Hackathon.jpeg"
    },
    {
        icon: "🏆",
        title: "Honorary Recognition from Jazan University",
        meta: "Jazan University · Sep 2024",
        desc: "Received recognition from the Deanship of Human Resources and Technology at Jazan University for participating in the 'Consulting Corner' for student projects during the Jazan University Digital Transformation Forum.",
        img: null
    },
    {
        icon: "🥇",
        title: "1st Place – Jaddathon Fikrathon 2023",
        meta: "Jada30 | جادة30 · Dec 2023",
        desc: "Secured first place at Fikrathon Jaddathon 2023 with MNBET, an AI-driven project that identifies coffee plant diseases and pests through image analysis. The idea focused on empowering the agricultural sector with intelligent tools to support farmers and boost coffee production quality in a sustainable way.",
        img: "img/Jaddathon Fikrathon.jpeg"
    },
    {
        icon: "🥉",
        title: "3rd Place – Environmental Sustainability Hackathon",
        meta: "Jazan University · Oct 2023",
        desc: "Won third place with MNBET, an AI-powered solution for detecting coffee plant diseases and pests using image recognition. The project aimed to support sustainable agriculture by helping farmers identify issues early, reduce pesticide usage, and enhance crop quality.",
        img: "img/Environmental Sustainability Hackathon.jpeg"
    },
    {
        icon: "🏆",
        title: "Kali Linux Course Recognition",
        meta: "Jazan University · Apr 2023",
        desc: "Honored by the college for conducting a Kali Linux course as part of the Ramadan Technical Nights series, sponsored by the college.",
        img: null
    }
];

let honorCurrent = 0;

function renderHonor() {
    const honor = honors[honorCurrent];
    document.querySelector('.honor-icon-box .honor-icon').textContent = honor.icon;
    document.querySelector('.honor-description strong').textContent = honor.title;
    document.querySelector('.honor-meta').textContent = honor.meta;
    document.querySelector('.honor-description p').textContent = honor.desc;
    const imgDiv = document.querySelector('.honor-img');
    if (honor.img) {
        imgDiv.innerHTML = `<img src="${honor.img}" alt="${honor.title}">`;
    } else {
        imgDiv.innerHTML = '';
    }
}

document.querySelector('.slider-honor-arrow.left').onclick = function() {
    honorCurrent = (honorCurrent + honors.length - 1) % honors.length;
    renderHonor();
};
document.querySelector('.slider-honor-arrow.right').onclick = function() {
    honorCurrent = (honorCurrent + 1) % honors.length;
    renderHonor();
};

renderHonor();

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelector('.nav-links');
const burger = document.querySelector('.burger');
const navItems = document.querySelectorAll('.nav-links li a');

// Add scrolled class to navbar on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('active');
});

// Close mobile menu when clicking a link
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            burger.classList.remove('active');
        }
    });
});

// Set active link based on scroll position
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 