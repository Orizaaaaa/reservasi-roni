'use client'
import { deleteCapster, getAllCapster, updateCapster } from '@/api/method';

import ButtonPrimary from '@/elements/buttonPrimary';
import CaraoselImage from '@/fragments/caraoselGalery/caraoselGalery';
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout'
import ModalDefault from '@/fragments/modal/modal';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { SwiperSlide } from 'swiper/react';
import { IoCloseCircleOutline } from 'react-icons/io5';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import ButtonSecondary from '@/elements/buttonSecondary';
import toast from 'react-hot-toast';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/react';
import { postImagesArray } from '@/api/image_post';
import ModalAlert from '@/fragments/modal/modalAlert';
import { it } from 'node:test';


type Props = {}

function Page({ }: Props) {
    const { onOpen, onClose, isOpen } = useDisclosure();
    const { isOpen: isGaleryOpen, onOpen: onGaleryOpen, onClose: onCloseGalery } = useDisclosure();
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const [id, setId] = useState('')
    const [album, setAlbum] = useState<string[]>([])
    const [formUpdate, setFormUpdate] = useState({
        schedule: {},
        album: [] as (File | string)[], // Can contain both File objects (new) and strings (existing URLs)
    });
    const [errorMsg, setErrorMsg] = useState({
        imageUpdate: '',
    });
    const [capters, setCapters] = useState<any[]>([]);
    const [selectedCapster, setSelectedCapster] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        try {
            const capster = await getAllCapster();
            setCapters(capster?.data || []);
        } catch (error) {
            console.error('Error fetching capsters:', error);
            toast.error('Gagal memuat data capster');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModalCreate = (capsterId: string, item: any) => {
        setSelectedCapster(capsterId);
        setFormUpdate({
            album: [...item?.album],
            schedule: item?.schedule, // Initialize with existing album images
        });
        onOpen();
    };

    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newImages: File[] = [];
        let hasError = false;

        // Validate each file
        Array.from(files).forEach((file) => {
            // Validate file type
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setErrorMsg((prev) => ({
                    ...prev,
                    imageUpdate: '*Hanya file PNG dan JPG yang diperbolehkan',
                }));
                hasError = true;
                return;
            }

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrorMsg((prev) => ({
                    ...prev,
                    imageUpdate: '*Ukuran file maksimal 5 MB',
                }));
                hasError = true;
                return;
            }

            newImages.push(file);
        });

        if (hasError) return;

        // Clear error if validation passes
        setErrorMsg((prev) => ({
            ...prev,
            imageUpdate: '',
        }));

        // Add new images to the form
        setFormUpdate((prevState) => ({
            ...prevState,
            album: [...prevState.album, ...newImages],
            schedule: formUpdate.schedule,
        }));
    };

    const deleteArrayImage = (index: number) => {
        setFormUpdate(prevState => ({
            ...prevState,
            album: prevState.album.filter((_, i) => i !== index)
        }));
    };

    const handleUpdate = async () => {
        if (!selectedCapster) return;
        if (formUpdate.album.length === 0) {
            toast.error('Harap tambahkan minimal satu foto');
            return;
        }

        setIsLoading(true);

        try {
            // Separate existing URLs and new Files
            const existingUrls = formUpdate.album.filter(item => typeof item === 'string') as string[];
            const newFiles = formUpdate.album.filter(item => item instanceof File) as File[];

            // Upload new files to Cloudinary
            let newImageUrls: string[] = [];
            if (newFiles.length > 0) {
                newImageUrls = await postImagesArray({ images: newFiles });
                // Filter out any failed uploads (null values)
                newImageUrls = newImageUrls.filter(url => url !== null);
            }

            // Combine existing URLs with new ones
            const updatedAlbum = [...existingUrls, ...newImageUrls];

            // Prepare data for API update
            const updateData = {
                album: updatedAlbum,
                schedule: formUpdate.schedule,
            };

            // Call the update API
            await updateCapster(selectedCapster, updateData, (result: any) => {
                console.log('Album foto berhasil diperbarui:', result);
                console.log('updateData', updateData);
                toast.success('Album foto berhasil diperbarui');
                fetchData(); // Refresh data
                onClose(); // Close modal
            });

        } catch (error) {
            console.error('Error updating capster album:', error);
            toast.error('Gagal memperbarui album foto');
        } finally {
            setIsLoading(false);
        }
    };

    const openModalDelete = (item: any) => {
        setId(item._id)
        onWarningOpen()
    }

    const openModalGalery = (item: any) => {
        console.log('galery', item);
        setAlbum(item.album)
        onGaleryOpen()
    }

    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus Capster...');
        try {
            const result = await deleteCapster(id); // id dari state atau props
            toast.success('Capster berhasil dihapus!', { id: toastId });
            console.log('result', result);

            // Refresh data dan tutup modal jika perlu
            fetchData(); // contoh fungsi ambil ulang data
            onWarningClose(); // jika kamu pakai modal
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus Capster.', { id: toastId });
        }
    };

    console.log('capters', id);
    console.log('album', album);
    console.log('formUpdate', formUpdate);
    console.log(selectedCapster);



    return (
        <DefaultLayout>
            <div className="flex justify-between items-center mb-3">
                <h1 className='text-black text-xl font-semibold'>ALL CAPSTERS</h1>
            </div>

            {capters?.map((item: any) => (
                <div
                    key={item._id}
                    className="bg-white shadow-lg rounded-2xl p-6 mb-6 transition hover:shadow-xl border border-gray-100"
                >
                    {/* Header: Avatar dan Info */}
                    <div className="flex flex-col md:flex-row items-center md:items-start md:gap-6">
                        <div className="w-28 h-52 md:w-40 md:h-56 mb-4 md:mb-0 rounded-xl overflow-hidden shadow-md">
                            <img
                                src={
                                    item.avatar ||
                                    'https://infokalteng.co/foto_berita/135642-dbb76965-0732-4b1b-bbe2-cbea751844c6.jpeg'
                                }
                                alt={item.username}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-xl font-semibold text-gray-800">{item.username}</h1>
                            <p className="text-sm text-emerald-700 font-medium mb-2">{item.spesialis}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                    </div>

                    {/* Album & Actions */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mt-6 gap-4">
                        {/* Album Preview */}
                        <div className="grid grid-cols-3 gap-3">
                            {item.album?.length > 0 ? (
                                item.album.slice(0, 3).map((imageUrl: string, index: number) => {
                                    if (index === 2 && item.album.length > 3) {
                                        const remainingCount = item.album.length - 3;
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => openModalGalery(item)}
                                                className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`album-${index}`}
                                                    className="w-full h-full object-cover rounded-lg opacity-40"
                                                />
                                                <span className="absolute text-white font-bold text-sm z-10">+{remainingCount}</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <img
                                            onClick={() => openModalGalery(item)}
                                            key={index}
                                            className="w-20 h-20 object-cover rounded-lg cursor-pointer shadow-sm hover:shadow-md transition"
                                            src={imageUrl}
                                            alt={`album-${index}`}
                                        />
                                    );
                                })
                            ) : (
                                Array(3)
                                    .fill(0)
                                    .map((_, index) => (
                                        <div
                                            key={index}
                                            className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs border border-dashed"
                                        >
                                            No Image
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition"
                                onClick={() => openModalDelete(item)}
                            >
                                Hapus Capster
                            </button>
                            <ButtonPrimary
                                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                onClick={() => openModalCreate(item._id, item || [])}
                            >
                                + Tambah Foto
                            </ButtonPrimary>
                            <button
                                className="py-2 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white transition"
                                onClick={() => router.push(`/admin_capster/edit_capster/${item._id}`)}
                            >
                                Edit Capster
                            </button>
                        </div>
                    </div>
                </div>
            ))}



            <ButtonPrimary
                className='py-2 px-3 rounded-xl mt-6'
                onClick={() => router.push('/admin_capster/add_capster')}
            >
                + Tambah Capster
            </ButtonPrimary>

            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className='text-black text-xl font-semibold mb-4'>TAMBAH FOTO ALBUM</h1>
                <div>
                    <CaraoselImage>
                        {formUpdate.album.length > 0 ? (
                            formUpdate.album.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <div className="relative">
                                        <div className="flex justify-center items-center h-[200px]">
                                            <img
                                                src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                                alt={`preview-${index}`}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            onClick={() => deleteArrayImage(index)}
                                            className="absolute top-2 right-2 z-10 bg-white rounded-full p-1"
                                        >
                                            <IoCloseCircleOutline color="red" size={24} />
                                        </button>
                                    </div>
                                </SwiperSlide>
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-[200px]">
                                <Image
                                    className="w-auto h-full"
                                    src={logo}
                                    alt="placeholder"
                                />
                            </div>
                        )}
                    </CaraoselImage>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <ButtonPrimary className='rounded-md relative cursor-pointer py-2 px-1'>
                            Tambah Foto
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg, image/jpg"
                                multiple
                            />
                        </ButtonPrimary>
                        <ButtonSecondary
                            className='rounded-md py-2 px-1'
                            onClick={() => setFormUpdate({ ...formUpdate, album: [] })}
                        >
                            Hapus Semua
                        </ButtonSecondary>
                    </div>

                    {errorMsg.imageUpdate && (
                        <p className='text-red-500 text-sm mt-2'>{errorMsg.imageUpdate}</p>
                    )}

                    <div className="mt-6">
                        <ButtonPrimary
                            className='w-full py-2 rounded-md'
                            onClick={handleUpdate}
                            disabled={formUpdate.album.length === 0 || isLoading}
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Foto'}
                        </ButtonPrimary>
                    </div>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                apakah anda yakin akan menghapus capster ini ?
                <div className="flex justify-end gap-3">
                    <button className='bg-red-900  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={onWarningClose}>Tidak</button>
                    <button className='bg-blue-500  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={handleDelete} >Ya</button>
                </div>
            </ModalAlert>

            <Modal
                size={'5xl'}
                isOpen={isGaleryOpen}
                onClose={onCloseGalery}
                placement='center'
                isDismissable={false} isKeyboardDismissDisabled={true}
            >
                <ModalContent>
                    <>
                        <ModalBody className={`overflow-x-hidden`}>
                            <div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-12 gap-4">
                                {album.map((imageUrl, index) => (
                                    <div className="h-20">
                                        <img
                                            key={index}
                                            className='w-full h-full object-cover rounded-lg cursor-pointer'
                                            src={imageUrl}
                                            alt={`album-${index}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </ModalBody>
                    </>
                </ModalContent>
            </Modal>
        </DefaultLayout>
    )
}

export default Page