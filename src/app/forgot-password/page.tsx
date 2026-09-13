"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { FaWhatsapp } from 'react-icons/fa';
import { Spinner } from '@heroui/react';
import InputForm from '@/elements/input/InputForm';
import ButtonPrimary from '@/elements/buttonPrimary';
import { logo } from '@/image';
import { forgotPasswordService } from '@/api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [waData, setWaData] = useState<{ waUrl: string; resetUrl: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setWaData(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setErrorMsg('*Email tidak boleh kosong');
            return;
        } else if (!emailRegex.test(email)) {
            setErrorMsg('*Format email tidak valid');
            return;
        }

        setLoading(true);

        await forgotPasswordService(email, (status: boolean, res: any) => {
            setLoading(false);
            if (status) {
                const waUrl = res.waUrl;
                const resetUrl = res.resetUrl;
                setWaData({ waUrl, resetUrl });

                if (waUrl) {
                    window.open(waUrl, '_blank');
                }
            } else {
                setErrorMsg(res.message || '*Pengguna dengan email ini tidak ditemukan');
            }
        });
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
                        Masukkan email akun admin Anda untuk mendapatkan link reset password via WhatsApp (085150589797).
                    </p>
                </div>

                {waData ? (
                    <div className="space-y-4 text-center">
                        <div className="bg-emerald-800/60 border border-emerald-400 text-emerald-100 p-4 rounded-lg text-sm space-y-2">
                            <p className="font-semibold">Link Reset Password Berhasil Dibuat!</p>
                            <p className="text-xs opacity-90">
                                WhatsApp telah dibuka secara otomatis. Kirim pesan ke nomor <strong>085150589797</strong> untuk menerima link reset.
                            </p>
                        </div>

                        <a
                            href={waData.waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full font-semibold py-2.5 rounded-lg bg-green-600 hover:bg-green-500 transition-all text-white shadow-lg"
                        >
                            <FaWhatsapp size={20} />
                            Kirim via WhatsApp (085150589797)
                        </a>

                        <div className="pt-2">
                            <Link
                                href={waData.resetUrl}
                                className="text-xs text-emerald-200 underline hover:text-white"
                            >
                                Atau langsung reset di sini
                            </Link>
                        </div>
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
                            {loading ? <Spinner className="w-5 h-5" size="sm" color="white" /> : (
                                <>
                                    <FaWhatsapp size={18} />
                                    <span>Reset Password via WhatsApp</span>
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
