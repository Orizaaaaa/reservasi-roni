export const users = [
    {
        key: "1",
        name: "Tony Reichert",
        role: "CEO",
        status: "Active",
    },
    {
        key: "2",
        name: "Zoey Lang",
        role: "Technical Lead",
        status: "Paused",
    },
    {
        key: "3",
        name: "Jane Fisher",
        role: "Senior Developer",
        status: "Active",
    },
    {
        key: "4",
        name: "William Howard",
        role: "Community Manager",
        status: "Vacation",
    },
    {
        key: "5",
        name: "Emily Collins",
        role: "Marketing Manager",
        status: "Active",
    },
    {
        key: "6",
        name: "Brian Kim",
        role: "Product Manager",
        status: "Active",
    },
    {
        key: "7",
        name: "Laura Thompson",
        role: "UX Designer",
        status: "Active",
    },
    {
        key: "8",
        name: "Michael Stevens",
        role: "Data Analyst",
        status: "Paused",
    },
    {
        key: "9",
        name: "Sophia Nguyen",
        role: "Quality Assurance",
        status: "Active",
    },
    {
        key: "10",
        name: "James Wilson",
        role: "Front-end Developer",
        status: "Vacation",
    },
    {
        key: "11",
        name: "Ava Johnson",
        role: "Back-end Developer",
        status: "Active",
    },
    {
        key: "12",
        name: "Isabella Smith",
        role: "Graphic Designer",
        status: "Active",
    },
    {
        key: "13",
        name: "Oliver Brown",
        role: "Content Writer",
        status: "Paused",
    },
    {
        key: "14",
        name: "Lucas Jones",
        role: "Project Manager",
        status: "Active",
    },
    {
        key: "15",
        name: "Grace Davis",
        role: "HR Manager",
        status: "Active",
    },
    {
        key: "16",
        name: "Elijah Garcia",
        role: "Network Administrator",
        status: "Active",
    },
    {
        key: "17",
        name: "Emma Martinez",
        role: "Accountant",
        status: "Vacation",
    },
    {
        key: "18",
        name: "Benjamin Lee",
        role: "Operations Manager",
        status: "Active",
    },
    {
        key: "19",
        name: "Mia Hernandez",
        role: "Sales Manager",
        status: "Paused",
    },
    {
        key: "20",
        name: "Daniel Lewis",
        role: "DevOps Engineer",
        status: "Active",
    },
    {
        key: "21",
        name: "Amelia Clark",
        role: "Social Media Specialist",
        status: "Active",
    },
    {
        key: "22",
        name: "Jackson Walker",
        role: "Customer Support",
        status: "Active",
    },
    {
        key: "23",
        name: "Henry Hall",
        role: "Security Analyst",
        status: "Active",
    },
    {
        key: "24",
        name: "Charlotte Young",
        role: "PR Specialist",
        status: "Paused",
    },
    {
        key: "25",
        name: "Liam King",
        role: "Mobile App Developer",
        status: "Active",
    },
];


export function capitalizeWords(str: string): string {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export const formatDate = (tanggal: any) => {
    if (!tanggal) {
        console.error("Tanggal tidak ada:", tanggal);
        return "Invalid date";  // Mengembalikan nilai default jika tanggal tidak ada
    }

    // Pastikan bahwa 'tanggal' merupakan string atau objek Date yang valid
    const date = new Date(tanggal);

    // Cek apakah objek Date valid
    if (isNaN(date.getTime())) {
        console.error("Format tanggal tidak valid:", tanggal);
        return "Invalid date";  // Mengembalikan nilai default jika format tanggal tidak valid
    }

    const tahun = date.getFullYear();
    const bulan = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0, jadi tambahkan 1
    const hari = String(date.getDate()).padStart(2, '0');

    return `${tahun}-${bulan}-${hari}`;
};



export const formatDateStr = (dateObj?: { month: number, day: number, year: number }) =>
    dateObj ? `${dateObj.month.toString().padStart(2, '0')}-${dateObj.day.toString().padStart(2, '0')}-${dateObj.year.toString().padStart(4, '0')}` : '';

export function formatRupiah(amount: number | undefined): string {
    if (amount === undefined) {
        return 'Rp 0';
    }
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}


export const hours: Record<string, number[]> = {
    Pagi: [10, 11, 12],
    Siang: [12, 13, 14, 15, 16, 17],
    Malam: [18, 19, 20, 21],
};

export const hourSchedule: Record<string, string[]> = {
    Pagi: ['10:00', '11:00', '12:00'],
    Siang: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    Malam: ['18:00', '19:00', '20:00', '21:00'],
};


export function parseName(name: string): string {
    const parts = name.trim().split(/\s+/); // Pisahkan berdasarkan spasi

    if (parts.length >= 2) {
        // Ambil huruf pertama dari dua kata pertama
        return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
        // Jika hanya satu kata, ambil huruf pertama dan terakhir
        const word = parts[0];
        return (word[0] + word[word.length - 1]).toUpperCase();
    } else {
        // Jika nama terlalu pendek, fallback ke huruf besar nama
        return name.toUpperCase();
    }
}
