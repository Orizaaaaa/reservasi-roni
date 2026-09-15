"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { HiOutlineMail } from 'react-icons/hi';
import { Spinner } from '@heroui/react';
import InputForm from '@/elements/input/InputForm';
import ButtonPrimary from '@/elements/buttonPrimary';
import { logo } from '@/image';
import { forgotPasswordService } from '@/api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submittedEmail, setSubmittedEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setErrorMsg('*Email tidak boleh kosong');
            return;
        }
        if (!emailRegex.test(email)) {
            setErrorMsg('*Format email tidak valid');
            return;
        }

        setLoading(true);

        try {
            await forgotPasswordService(email, (status: boolean, res: any) => {
                setLoading(false);
                if (status) {
                    setSubmittedEmail(email);
                    setSuccessMsg(
                        (typeof res?.message === 'string' && res.message) ||
                        'Link reset password telah dikirim ke email Anda. Cek inbox atau folder spam.'
                    );
                    return;
                }

                const apiMessage =
                    (typeof res?.message === 'string' && res.message) ||
                    (typeof res?.data?.message === 'string' && res.data.message) ||
                    '*Pengguna dengan email ini tidak ditemukan';
                setErrorMsg(apiMessage);
            });
        } catch {
            setLoading(false);
            setErrorMsg('*Terjadi kesalahan. Silakan coba lagi.');
        }
    };

    const resetForm = () => {
        setSuccessMsg('');
        setSubmittedEmail('');
        setEmail('');
        setErrorMsg('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] flex items-center justify-center px-4">
            <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-2xl text-white relative">
                <Link
                    href="/login"
                    className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors"
                >
                    <IoIosArrowBack size={20} />
                    Kembali
                </Link>

                <div className="logo flex justify-center mt-4">
                    <Image src={logo} alt="logo" width={160} height={100} />
                </div>

                <div className="text-center my-4">
                    <h1 className="text-xl font-bold">Lupa Password</h1>
                    <p className="text-sm text-white/70 mt-1">
                        Masukkan email akun admin Anda. Kami akan mengirim link reset password ke email tersebut.
                    </p>
                </div>

                {successMsg ? (
                    <div className="space-y-4 text-center">
                        <div className="bg-emerald-800/60 border border-emerald-400 text-emerald-100 p-4 rounded-lg text-sm space-y-2">
                            <p className="font-semibold">Email berhasil dikirim!</p>
                            <p className="text-xs opacity-90">
                                Link reset password telah dikirim ke <strong>{submittedEmail || email}</strong>.
                                Link berlaku selama <strong>15 menit</strong>. Cek juga folder spam jika belum muncul.
                            </p>
                        </div>

                        <ButtonPrimary
                            typeButon="button"
                            onClick={resetForm}
                            className="rounded-lg w-full font-semibold py-2 bg-primary transition-all duration-200 text-white"
                        >
                            Kirim Ulang ke Email Lain
                        </ButtonPrimary>

                        <Link
                            href="/login"
                            className="block text-sm text-emerald-200 underline hover:text-white"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <InputForm
                            className="bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none"
                            errorMsg={errorMsg}
                            placeholder="Masukkan Email Admin Anda"
                            type="email"
                            htmlFor="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        />

                        <ButtonPrimary
                            typeButon="submit"
                            className="rounded-lg w-full font-semibold py-2 bg-primary transition-all duration-200 text-white flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Spinner className="w-5 h-5" size="sm" color="default" />
                            ) : (
                                <>
                                    <HiOutlineMail size={18} />
                                    <span>Kirim Link ke Email</span>
                                </>
                            )}
                        </ButtonPrimary>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
