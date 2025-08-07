'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { IoIosArrowBack } from 'react-icons/io'

type Props = {}

function ButtonBack({ }: Props) {
    const router = useRouter()
    return (
        <button onClick={() => router.back()} className='bg-white py-1 px-3 rounded-full flex gap-2 justify-center items-center' >
            <IoIosArrowBack size={20} />
            <h1 className='font-semibold' >Back</h1>
        </button>
    )
}

export default ButtonBack