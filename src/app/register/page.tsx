'use client'
import { registerUser } from '@/api/auth'
import ButtonPrimary from '@/elements/buttonPrimary'
import InputForm from '@/elements/input/InputForm'
import { logo3 } from '@/image'
import { Autocomplete, Spinner } from '@heroui/react'
import { a } from 'framer-motion/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { FaEyeSlash } from 'react-icons/fa'
import { IoEye } from 'react-icons/io5'

type Props = {}

const page = (props: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    const [typePassword, setTypePassword] = useState("password");
    const [typeConfirmPassword, setTypeConfirmPassword] = useState("password");
    const [form, setForm]: any = useState({
        username: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });

    const [errorMsg, setErrorMsg] = useState({
        username: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
        responErrorApi: '',

    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            let numericValue = value.replace(/\D/g, '');
            if (numericValue.startsWith('08')) {
                numericValue = '628' + numericValue.slice(2);
            }

            if (numericValue.length > 15) {
                setErrorMsg((prev) => ({
                    ...prev,
                    phone: '*Nomor tidak boleh lebih dari 15 angka',
                }));
                return;
            } else {
                setErrorMsg((prev) => ({ ...prev, phone: '' }));
            }

            setForm({ ...form, [name]: numericValue });
            return;
        }


        setForm({ ...form, [name]: value });
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
        setTypePassword(showPassword ? "text" : "password");
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
        setTypeConfirmPassword(showConfirmPassword ? "text" : "password");
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const newErrorMsg = {
            username: '', email: '', password: '', confirmPassword: '', address: '',
            responErrorApi: ''

        };
        let valid = true;

        const nameRegex = /^[A-Za-z\s\-\_\'\.\,\&\(\)]{1,100}$/;
        const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^[A-Za-z0-9]+$/;

        if (!form.username || !nameRegex.test(form.name)) {
            newErrorMsg.username = '*Masukkan nama yang valid';
            valid = false;
        }

        if (!form.email || !emailRegex.test(form.email)) {
            newErrorMsg.email = '*Masukkan email yang valid';
            valid = false;
        }

        if (!form.password || !passwordRegex.test(form.password) || form.password.length < 8) {
            newErrorMsg.password = '*Password harus 8 karakter atau lebih';
            valid = false;
        }

        if (form.password !== form.confirmPassword) {
            newErrorMsg.confirmPassword = '*Password dan Konfirmasi tidak sama';
            valid = false;
        }
        if (!form.address) {
            newErrorMsg.address = '*Alamat wajib diisi';
            valid = false;
        }

        setErrorMsg(newErrorMsg);
        if (!valid) {
            setLoading(false);
            return;
        }

        const { confirmPassword, ...dataWithoutConfirmPassword } = form;
        const data = {
            ...dataWithoutConfirmPassword,
        };

        registerUser(data, (status: boolean, res: any) => {
            if (res) {
                console.log(res);
            }
            if (status) {
                router.push('/');
            } else {
                setErrorMsg((prev) => ({ ...prev, responErrorApi: 'Email atau Password salah' }));
            }
            setLoading(false);
        });

    }
    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-gray-100">

            <form className="p-6 bg-[#e9e9e9] rounded-lg m-3 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px]" onSubmit={handleRegister}>
                <div className="logo flex justify-center my-5">
                    <Image src={logo3} alt="logo" width={180} height={130} />
                </div>
                <InputForm className="bg-slate-300" errorMsg={errorMsg.username} placeholder="Masukkan Nama" type="text" htmlFor="username" value={form.username} onChange={handleChange} />

                <div className="flex gap-4">
                    <InputForm className="bg-slate-300" errorMsg={errorMsg.email} placeholder="Masukkan email" type="text" htmlFor="email" value={form.email} onChange={handleChange} />
                    <InputForm className="bg-slate-300" errorMsg={errorMsg.address} placeholder="Masukkan Alamat" type="text" htmlFor="address" value={form.address} onChange={handleChange} />
                </div>

                <div className="relative">
                    <button onClick={togglePassword} type="button" className="absolute right-0 top-1/2 -translate-y-1/2 pe-4">
                        {showPassword ? <FaEyeSlash size={20} color="#636363" /> : <IoEye size={20} color="#636363" />}
                    </button>
                    <InputForm className="bg-slate-300" errorMsg={errorMsg.password} htmlFor="password" onChange={handleChange} type={typePassword} value={form.password} placeholder="Masukkan Kata Sandi" />
                </div>

                <div className="relative mt-1">
                    <button onClick={toggleConfirmPassword} type="button" className="absolute right-0 top-1/2 -translate-y-1/2 pe-4">
                        {showConfirmPassword ? <FaEyeSlash size={20} color="#636363" /> : <IoEye size={20} color="#636363" />}
                    </button>
                    <InputForm className="bg-slate-300" errorMsg={errorMsg.confirmPassword} htmlFor="confirmPassword" onChange={handleChange} type={typeConfirmPassword} value={form.confirmPassword} placeholder="Konfirmasi Kata Sandi" />
                </div>

                <ButtonPrimary disabled={loading} typeButon="submit" className="rounded-lg cursor-pointer w-full mb-3 font-medium py-2 flex justify-center items-center bg-primary">
                    {loading ? <Spinner color="white" /> : "Daftar"}
                </ButtonPrimary>
                {errorMsg.responErrorApi && <p className="text-red-800 text-xs mt-1">{errorMsg.responErrorApi}</p>}
                <p className="text-sm">Sudah punya akun? <Link href="/" className="text-primary font-medium">Masuk</Link></p>
            </form>
        </div>

    )
}

export default page