'use client'
import { getCapsterById } from '@/api/method'
import ButtonBack from '@/elements/buttonBack'
import MobileLayout from '@/fragments/layout/mobileLayout/mobileLayout'
import BottomNavigation from '@/fragments/nav/navigation'
import { haircut, regular_cut, yangyang2 } from '@/image'
import { Button } from '@heroui/react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCrown, FaHeart, FaStar } from 'react-icons/fa'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

type Props = {}

const page = (props: Props) => {
    const { id }: any = useParams()
    console.log('id', id);
    const [data, setData] = useState<any>({})
    useEffect(() => {
        if (!id) return
        getCapsterById(id, (res: any) => {
            const result = res.data
            setData(result)
        })
    }, [id])

    console.log('data', data);

    return (
        <section>
            <section className="header w-full bg-secondBlack p-4">
                <ButtonBack />
                <div className="flex flex-col justify-center items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden">
                        <img
                            className='w-full h-full object-cover'
                            src={data.avatar}
                            alt="capster avatar"
                            width={160}
                            height={160}
                        />
                    </div>
                    <div className="flex mt-10 gap-7">
                        <div className="box-1 flex flex-col justify-center items-center">
                            <div className="p-5 bg-black rounded-full">
                                <FaHeart color='white' size={27} />
                            </div>
                            <h1 className='text-yellowCustom font-bold mt-3'>1370 Cust</h1>
                            <p className='text-white font-light text-xs'>Served</p>
                        </div>
                        <div className="box-1 flex flex-col justify-center items-center">
                            <div className="p-5 bg-black rounded-full">
                                <FaCrown color='white' size={27} />
                            </div>
                            <h1 className='text-yellowCustom font-bold mt-3'>10 Years</h1>
                            <p className='text-white font-light text-xs'>experience</p>
                        </div>
                        <div className="box-1 flex flex-col justify-center items-center">
                            <div className="p-5 bg-black rounded-full">
                                <FaStar color='white' size={27} />
                            </div>
                            <h1 className='text-yellowCustom font-bold mt-3'>4.5</h1>
                            <p className='text-white font-light text-xs'>Rating</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="w-full flex justify-center items-center mt-4">
                <div className="title text-center flex flex-col justify-center items-center">
                    <h1 className='text-2xl font-semibold'>{data.username?.toUpperCase() || 'CAPSTER'}</h1>
                    <p>Spesialis di {data.spesialis || 'Potong Rambut'}</p>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} size={20} color='#E67514' />
                        ))}
                    </div>
                </div>
            </div>

            <section className='p-4'>
                <h1 className='font-semibold'>About Capster</h1>
                <p>{data.description || 'No description available'}</p>
            </section>

            <section className='p-4'>
                <h1 className='font-semibold mb-3'>Histori</h1>
                <div className="">
                    <Swiper
                        slidesPerView={'auto'}
                        spaceBetween={16}
                        pagination={{ clickable: true }}
                        modules={[Pagination]}
                        className="mySwiper"
                    >
                        {data.album?.map((imageUrl: string, index: number) => (
                            <SwiperSlide key={index} className="!w-[80%]">
                                <div className="border border-grayCustom bg-secondBlack p-2 rounded-xl">
                                    <div className="h-56 relative">
                                        <img
                                            className="w-full h-full object-cover rounded-lg"
                                            src={imageUrl}
                                            alt={`history ${index}`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-start w-full mt-2">
                                        <div className="text">
                                            <h1 className="text-white">HISTORY WORK {index + 1}</h1>
                                            <h1 className="text-white">50K</h1>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={20} color='#E67514' />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </section>
    )
}

export default page