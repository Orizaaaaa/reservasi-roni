"use client";

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEyeSlash } from 'react-icons/fa6';
import { IoEye } from 'react-icons/io5';
import { IoIosArrowBack } from 'react-icons/io';
import { Spinner } from '@heroui/react';
import InputForm from '@/elements/input/InputForm';
import ButtonPrimary from '@/elements/buttonPrimary';
import { logo } from '@/image';
import { resetPasswordService } from '@/api/auth';

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        password: '',
        confirmPassword: ''
    });

    const [errorMsg, setErrorMsg] = useState({
        password: '',
        confirmPassword: '',
        general: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg({ password: '', confirmPassword: '', general: '' });

        if (!token) {
            setErrorMsg(prev => ({ ...prev, general: '*Token reset password tidak ditemukan pada URL' }));
            return;
        }

        let valid = true;
        let errors = { password: '', confirmPassword: '', general: '' };

        if (!form.password) {
            errors.password = '*Password baru tidak boleh kosong';
            valid = false;
        } else if (form.password.length < 8) {
            errors.password = '*Password minimal 8 karakter';
            valid = false;
        }

        if (!form.confirmPassword) {
            errors.confirmPassword = '*Konfirmasi password tidak boleh kosong';
            valid = false;
        } else if (form.password !== form.confirmPassword) {
            errors.confirmPassword = '*Konfirmasi password tidak cocok';
            valid = false;
        }

        if (!valid) {
            setErrorMsg(errors);
            return;
        }

        setLoading(true);

        await resetPasswordService({ token, password: form.password }, (status: boolean, res: any) => {
            setLoading(false);
            if (status) {
                setSuccess(true);
            } else {
                setErrorMsg(prev => ({ ...prev, general: res.message || '*Gagal mereset password. Token mungkin sudah kedaluwarsa.' }));
            }
        });
    };

    return (
        <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-2xl text-white relative">
            <Link
                href="/login"
                className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors"
            >
                <IoIosArrowBack size={20} />
                Ke Login
            </Link>

            <div className="logo flex justify-center mt-4">
                <Image src={logo} alt="logo" width={160} height={100} />
            </div>

            <div className="text-center my-4">
                <h1 className="text-xl font-bold">Reset Password</h1>
                <p className="text-sm text-white/70 mt-1">
                    Masukkan kata sandi baru untuk akun admin Anda.
                </p>
            </div>

            {success ? (
                <div className="space-y-4 text-center">
                    <div className="bg-emerald-800/60 border border-emerald-400 text-emerald-100 p-4 rounded-lg text-sm">
                        Password berhasil diperbarui! Silakan masuk kembali dengan password baru Anda.
                    </div>
                    <ButtonPrimary
                        typeButon="button"
                        onClick={() => router.push('/login')}
                        className="rounded-lg w-full font-semibold py-2 bg-primary transition-all duration-200 text-white"
                    >
                        Ke Halaman Login
                    </ButtonPrimary>
                </div>
            ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {errorMsg.general && (
                        <p className="text-red-300 text-sm text-center bg-red-900/40 p-2 rounded border border-red-500/30">
                            {errorMsg.general}
                        </p>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            type="button"
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 z-10 ${errorMsg.password ? 'top-[45%]' : ''}`}
                        >
                            {showPassword ? <IoEye size={20} color="#fff" /> : <FaEyeSlash size={20} color="#fff" />}
                        </button>
                        <InputForm
                            errorMsg={errorMsg.password}
                            className="bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none"
                            htmlFor="password"
                            onChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            placeholder="Kata Sandi Baru"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            type="button"
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 z-10 ${errorMsg.confirmPassword ? 'top-[45%]' : ''}`}
                        >
                            {showConfirmPassword ? <IoEye size={20} color="#fff" /> : <FaEyeSlash size={20} color="#fff" />}
                        </button>
                        <InputForm
                            errorMsg={errorMsg.confirmPassword}
                            className="bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none"
                            htmlFor="confirmPassword"
                            onChange={handleChange}
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            placeholder="Konfirmasi Kata Sandi Baru"
                        />
                    </div>

                    <ButtonPrimary
                        typeButon="submit"
                        className="rounded-lg w-full font-semibold py-2 bg-primary transition-all duration-200 text-white mt-2"
                    >
                        {loading ? <Spinner className="w-5 h-5" size="sm" color="white" /> : 'Simpan Password Baru'}
                    </ButtonPrimary>
                </form>
            )}
        </div>
    );
};

const ResetPassword = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] flex items-center justify-center px-4">
            <Suspense fallback={<Spinner color="white" />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
};

export default ResetPassword;
