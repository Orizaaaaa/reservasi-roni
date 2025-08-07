'use client'
import Image from "next/image";

import { IoSearch, IoStar } from "react-icons/io5";
import { mukti, regular_cut } from "@/image";
import { Button } from "@heroui/react";
import { IoIosNotifications, IoIosSettings } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/fragments/nav/navigation";
import { getAllCapster, getAllPayments, getAllReservation, getAllService } from "@/api/method";
import React, { useEffect, useState } from "react";
import { formatRupiah, parseName } from "@/utils/helper";
import { h1, section } from "framer-motion/client";

export default function HomeScreen() {
    const today = new Date();
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = React.useState<any>([]);
    const [filteredBooking, setFilteredBooking] = React.useState<any>([]);
    const [services, setServices] = React.useState<any>([]);
    const [capsters, setCapsters] = React.useState<any>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const fetchData = async () => {
        setLoading(false);
        const booking = await getAllReservation()
        const capsters = await getAllCapster()
        const data = await getAllService()
        setServices(data?.data || [])
        setBooking(booking?.data || [])
        setFilteredBooking(booking?.data || [])
        setCapsters(capsters?.data || [])
        setLoading(true);
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBooking(booking);
        } else {
            const filtered = booking.filter((item: any) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooking(filtered);
        }
    }, [searchQuery, booking]);

    const formatDate = (date: Date) => {
        const hari = date.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase(); // KAMIS
        const bulan = date.toLocaleDateString('id-ID', { month: 'long' }).toUpperCase();  // AGUSTUS
        const tanggal = date.getDate(); // 25

        return `${hari} ${bulan} ${tanggal}`;
    };

    return (
        <section className="bg-white" >
            {loading ? (

                <section>
                    <div className=" container mx-auto px-2 ">
                        <div className="flex justify-between items-center">
                            <p>{''}</p>
                            <h1 className="text font-bold text-grayCustom" >{formatDate(today)}</h1>
                            <p>{''}</p>
                        </div>


                        <div className="flex w-full px-3 py-2 items-center gap-3 rounded-lg shadow-lg shadow-black/30 mt-4 border-2 border-grayCustom" >
                            <IoSearch color="#3E5F44" size={20} />
                            <input
                                placeholder="SEARCH"
                                className=" border-none w-full placeholder-gray-500 outline-none"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>


                        <h1 className="text text-sm text-grayCustom mt-6 mb-3" >LATEST VISIT</h1>

                        <div >
                            <Swiper
                                slidesPerView={'auto'}
                                spaceBetween={16}
                                pagination={{ clickable: true }}
                                modules={[Pagination]}
                                className="mySwiper"
                            >

                                {filteredBooking?.map((item: any, index: number) => (
                                    <SwiperSlide className="!w-[90%]" key={index}>
                                        <div className="flex gap-4 border border-grayCustom bg-primary p-2 rounded-xl">
                                            <div className="h-full w-auto max-w-[80px] flex-shrink-0">
                                                <div className="bg-gray-300 w-full h-full flex items-center justify-center p-5 rounded-lg">
                                                    <h1 className="font-semibold" >{parseName(item.name)}</h1>
                                                </div>
                                            </div>

                                            <div className="text-grayCustom">
                                                <h1 className="text-white">{item.name}</h1>
                                                <h1 className="text-sm text-yellowCustom uppercase" >CAPSTER BY {item?.capster_id?.username}</h1>
                                                <div className="flex items-center gap-2">
                                                    <IoStar color="#f9d41c" />
                                                    <h1 className="text-white">{item.rating}</h1>
                                                    <GoDotFill size={5} />
                                                    <h1 className="text-sm text-white">114 review</h1>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                                {filteredBooking.length === 0 && (
                                    <SwiperSlide className="!w-[90%]">
                                        <div className="flex gap-4 border border-grayCustom bg-primary p-2 rounded-xl justify-center items-center">
                                            <h1 className="text-white">No bookings found</h1>
                                        </div>
                                    </SwiperSlide>
                                )}
                            </Swiper>
                        </div>


                        <h1 className="text text-sm text-grayCustom mt-6 mb-3" >PRICE LIST KABARBERSHOP</h1>

                        <div className="mb-5">
                            <Swiper
                                slidesPerView={'auto'}
                                spaceBetween={16}
                                pagination={{ clickable: true }}
                                modules={[Pagination]}
                                className="mySwiper"
                            >

                                {services.map((item: any, index: number) => (
                                    <SwiperSlide key={index} className="!w-[80%]">
                                        <div className="border border-grayCustom bg-primary p-2 rounded-xl">
                                            <div className="h-56">
                                                <img className="w-full h-full object-cover rounded-lg" src={item.image} alt="logo" />
                                            </div>
                                            <div className="flex justify-between items-start w-full mt-2">
                                                <div className="text">
                                                    <h1 className="text-yellowCustom text-small">OPEN NOW</h1>
                                                    <h1 className="text-white">{item.description}</h1>
                                                    <h1 className="text-white">{formatRupiah(item.price)}</h1>
                                                </div>
                                                <Button onClick={() => router.push('/booking')} className="bg-yellowCustom font-bold rounded-md px-4 py-2 text-black text-sm whitespace-nowrap">
                                                    BOOK NOW
                                                </Button>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <h1 className="text text-sm text-grayCustom mt-6 mb-3" >CAPSTER</h1>
                        <div className="mb-16">
                            <Swiper
                                slidesPerView={'auto'}
                                spaceBetween={16}
                                pagination={{ clickable: true }}
                                modules={[Pagination]}
                                className="mySwiper"
                            >
                                {capsters.map((item: any, index: number) => (
                                    <SwiperSlide key={index} className="!w-[93%]">
                                        <div className="capster bg-primary rounded-xl" onClick={() => router.push(`/about_capster/${item._id}`)}>
                                            <div className="flex ">
                                                <div className="w-32 h-48">
                                                    <img className="w-full h-full object-cover rounded-xl" src={item.avatar} alt="" />
                                                </div>
                                                <div className="p-3">
                                                    <h1 className="text-yellowCustom font-medium text-sm" >CAPSTER</h1>
                                                    <h1 className="text-white text-sm capitalize" >{item.username}</h1>
                                                    <div className="border border-slate-300 rounded-full p-1 mt-2">
                                                        <h1 className="text-white text-sm text-center text-[10px] capitalize" >{item.spesialis}</h1>
                                                    </div>
                                                    <p className="text-white text-xs mt-4" >{item.description} </p>
                                                </div>

                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <BottomNavigation />
                    </div>
                </section>
            ) : (

                <section className="bg-white">
                    <div className="container mx-auto px-2">
                        {/* Date Skeleton */}
                        <div className="flex justify-between items-center ">
                            <div className="w-10 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-10 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        {/* Search Bar Skeleton */}
                        <div className="flex w-full px-3 py-2 items-center gap-3 rounded-lg shadow-lg shadow-black/30 mt-4 border-2 border-grayCustom ">
                            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        </div>

                        {/* Latest Visit Skeleton */}
                        <div className="h-4 w-32 bg-gray-200 rounded mt-6 mb-3 "></div>
                        <div className="">
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="w-[90%] flex-shrink-0">
                                        <div className="flex gap-4 border border-grayCustom bg-primary p-2 rounded-xl ">
                                            <div className="w-20 h-20 bg-gray-300 rounded-lg animate-pulse"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                                                <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 bg-gray-300 rounded w-4 animate-pulse"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-8 animate-pulse"></div>
                                                    <div className="h-1 bg-gray-300 rounded w-1 animate-pulse"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price List Skeleton */}
                        <div className="h-4 w-48 bg-gray-200 rounded mt-6 mb-3 "></div>
                        <div className=" mb-5">
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="w-[80%] flex-shrink-0">
                                        <div className="border border-grayCustom bg-primary p-2 rounded-xl">
                                            <div className="h-56 bg-gray-300 rounded-lg animate-pulse"></div>
                                            <div className="flex justify-between items-start w-full mt-2">
                                                <div className="space-y-2">
                                                    <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                                                </div>
                                                <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Capster Skeleton */}
                        <div className="h-4 w-24 bg-gray-200 rounded mt-6 mb-3 "></div>
                        <div className=" mb-16">
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="w-[93%] flex-shrink-0">
                                        <div className="bg-primary rounded-xl">
                                            <div className="flex">
                                                <div className="w-32 h-48 bg-gray-300 rounded-xl animate-pulse"></div>
                                                <div className="p-3 flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                                                    <div className="border border-slate-300 rounded-full p-1 mt-2 w-20 h-6 bg-gray-300"></div>
                                                    <div className="space-y-1 mt-4">
                                                        <div className="h-2 bg-gray-300 rounded w-full animate-pulse"></div>
                                                        <div className="h-2 bg-gray-300 rounded w-5/6 animate-pulse"></div>
                                                        <div className="h-2 bg-gray-300 rounded w-4/6 animate-pulse"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Navigation Skeleton */}
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </section>
            )}

        </section >
    );
}