"use client"; // Pastikan seluruh komponen ini dirender di sisi klien

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { FaEyeSlash } from 'react-icons/fa6';
import { IoEye } from 'react-icons/io5';

import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { loginService } from '@/api/auth';
import { Spinner } from '@heroui/react';
import InputForm from '@/elements/input/InputForm';
import ButtonPrimary from '@/elements/buttonPrimary';
import { logo, logo3 } from '@/image';

const Login = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(true);
    const [errorLogin, setErrorLogin] = useState('');
    const [typePassword, setTypePassword] = useState("password");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState({
        email: '',
        password: ''
    })
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const togglePassword = () => {
        setShowPassword(!showPassword);
        setTypePassword(showPassword ? "text" : "password");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let isValid = true;
        let errors = { email: '', password: '' };

        // Validasi email tidak boleh kosong dan harus sesuai format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email) {
            errors.email = '*Email tidak boleh kosong';
            isValid = false;
        } else if (!emailRegex.test(form.email)) {
            errors.email = '*Email tidak sesuai format';
            isValid = false;
        }

        // Validasi password tidak boleh kosong dan harus lebih dari 8 karakter
        if (!form.password) {
            errors.password = '*Password tidak boleh kosong';
            isValid = false;
        } else if (form.password.length < 8) {
            errors.password = '*Password harus lebih dari 8 karakter';
            isValid = false;
        }

        // Jika tidak valid, set error dan hentikan proses
        if (!isValid) {
            setErrorMsg(errors);
            setLoading(false);
            return;
        }

        // Reset error messages
        setErrorMsg({ email: '', password: '' });

        // Lakukan login
        await loginService(form, (status: boolean, res: any) => {
            if (status) {
                console.log('kanjut', res.data);
                setErrorLogin('');
                const tokenCookies = `token=${res.data.token}`;
                const roleCookies = `role=${res.data.role}`;
                document.cookie = tokenCookies; // Set cookie
                document.cookie = roleCookies; // Set cookie
                localStorage.setItem('name', res.data.name);
                localStorage.setItem('id', res.data.id);
                localStorage.setItem('image', res.data.image);
                localStorage.setItem('role', res.data.role);
                localStorage.setItem('token', res.data.token);
                setLoading(false);

                // Redirect berdasarkan role
                if (res) {
                    router.push('/admin_dashboard');
                }
            } else {
                setErrorLogin('*Email atau password salah');
                console.log(res.data);
                setLoading(false);
            }
        });
    };


    return (
        <div className="login min-h-screen bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] flex items-center justify-center px-4">
            <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-2xl text-white">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="logo flex justify-center">
                        <Image src={logo} alt="logo" width={160} height={100} />
                    </div>

                    <InputForm
                        className="bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none "
                        errorMsg={errorMsg.email}
                        placeholder="Masukkan Email"
                        type="email"
                        htmlFor="email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <div className="relative">
                        <button
                            onClick={togglePassword}
                            type="button"
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 z-10 ${errorMsg.password ? 'top-[45%]' : ''}`}
                        >
                            {showPassword ? <FaEyeSlash size={20} color="#fff" /> : <IoEye size={20} color="#fff" />}
                        </button>
                        <InputForm
                            errorMsg={errorMsg.password}
                            className="bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none "
                            htmlFor="password"
                            onChange={handleChange}
                            type={typePassword}
                            value={form.password}
                            placeholder="Masukkan Kata Sandi"
                        />
                    </div>

                    {errorLogin && <p className="text-red-300 text-sm text-center">{errorLogin}</p>}

                    <ButtonPrimary
                        typeButon="submit"
                        className="rounded-lg w-full font-semibold py-2 bg-primary transition-all duration-200 text-white"
                    >
                        {loading ? <Spinner className="w-5 h-5" size="sm" color="white" /> : 'Masuk'}
                    </ButtonPrimary>
                </form>
            </div>
        </div>



    );
};

export default Login;
