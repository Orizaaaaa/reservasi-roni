'use client'
import { postImage } from '@/api/image_post';
import { createService, deleteService, getAllService, updateService } from '@/api/method';
import ButtonPrimary from '@/elements/buttonPrimary';
import ButtonSecondary from '@/elements/buttonSecondary';
import InputSecond from '@/elements/input/InputSecond';
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout'
import ModalDefault from '@/fragments/modal/modal';
import ModalAlert from '@/fragments/modal/modalAlert';
import { formatRupiah, users } from '@/utils/helper';
import { getKeyValue, image, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react';
import React, { useEffect } from 'react'
import toast from 'react-hot-toast';
import { CiCamera } from 'react-icons/ci';
import { FaTrash } from 'react-icons/fa';
import { RiEdit2Fill } from 'react-icons/ri';

type Props = {}

function page({ }: Props) {
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [services, setServices] = React.useState([])
    const [id, setId] = React.useState('')
    const [form, setForm]: any = React.useState({
        name: "",
        description: "",
        price: 0,
        image: null as File | null,
    });


    const [formUpdate, setFormUpdate]: any = React.useState({
        name: "",
        description: "",
        price: 0,
        image: null as File | null,
    })

    const fetchData = async () => {
        const data = await getAllService()
        setServices(data?.data || [])
    }

    useEffect(() => {
        fetchData();
    }, []);

    const [page, setPage]: any = React.useState(1);
    const rowsPerPage = 4;

    const pages = Math.ceil(users.length / rowsPerPage);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev: { name: string }) => ({ ...prev, [name]: value }));
    };
    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormUpdate((prev: { name: string }) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi form
        if (!form.name || !form.description || !form.price || !form.image) {
            toast.error("Semua field wajib diisi!");
            return;
        }

        try {
            toast.loading("Mengunggah gambar...");

            let imageUrl = "";

            // Upload gambar ke Cloudinary
            if (form.image) {
                imageUrl = await postImage({ image: form.image });
            }

            toast.dismiss(); // Hapus toast loading sebelumnya

            const payload = {
                ...form,
                image: imageUrl, // Ganti File dengan URL
            };

            toast.loading("Menyimpan data...");

            await createService(payload, (res: any) => {
                toast.dismiss(); // Hapus toast loading sebelumnya
                toast.success("Layanan berhasil dibuat!");
                console.log(res);
                fetchData();
                onClose();
                setForm({
                    image: null,
                    name: "",
                    description: "",
                    price: 0
                });
            });

        } catch (error) {
            toast.dismiss();
            toast.error("Terjadi kesalahan saat membuat layanan.");
            console.error("Terjadi kesalahan:", error);
        }
    };

    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus layanan...');
        try {
            const result = await deleteService(id);
            if (result) {
                toast.success('Layanan berhasil dihapus!', { id: toastId });
                fetchData();
                onCloseDelete();
            } else {
                toast.error('Gagal menghapus layanan.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat menghapus.', { id: toastId });
        }
    };

    const handleFileManager = (fileName: string) => {
        if (fileName === 'add') {
            const fileInput = document.getElementById("image-input-add") as HTMLInputElement | null;
            fileInput ? fileInput.click() : null;
        } else {
            const fileInput = document.getElementById("image-input-update") as HTMLInputElement | null;
            fileInput ? fileInput.click() : null;

        }
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, InputSelect: string) => {
        if (InputSelect === 'add') {
            const selectedImage = e.target.files?.[0];
            setForm({ ...form, image: selectedImage || null });
        } else {
            const selectedImage = e.target.files?.[0];
            setFormUpdate({ ...formUpdate, image: selectedImage || null });
        }
    };

    const handleOpenModalDelete = (id: string) => {
        setId(id)
        console.log('id', id);

        onOpenDelete()
    }


    const handleOpenModalUpdate = (item: any) => {
        onOpenUpdate()
        setId(item._id)
        setFormUpdate(item)
    }

    const handleUpdate = async (e: any) => {
        e.preventDefault();

        // Validasi: semua field harus diisi (name, description, price)
        const requiredFields = ['name', 'description', 'price'];
        const isEmpty = requiredFields.some((key) => {
            const value = formUpdate[key as keyof typeof formUpdate];
            return value === null || value === '' || (typeof value === 'number' && isNaN(value));
        });

        if (isEmpty) {
            toast.error('⚠️ Semua data di form harus diisi!');
            return;
        }

        try {
            let imageUrl = '';

            // Cek apakah image diupdate
            if (formUpdate.image) {
                if (typeof formUpdate.image === 'string' && formUpdate.image.startsWith('https')) {
                    // Jika sudah berupa URL
                    imageUrl = formUpdate.image;
                } else {
                    // Jika file baru diunggah
                    const uploadToast = toast.loading('📤 Mengunggah gambar...');
                    try {
                        const uploadedImageUrl = await postImage({ image: formUpdate.image as File });
                        if (!uploadedImageUrl) throw new Error('URL gambar tidak tersedia');

                        imageUrl = uploadedImageUrl;
                        toast.success('✅ Gambar berhasil diunggah', { id: uploadToast });
                    } catch (error) {
                        toast.error('❌ Gagal mengunggah gambar', { id: uploadToast });
                        return;
                    }
                }
            }

            const updateToast = toast.loading('⏳ Menyimpan perubahan...');

            // Lakukan update dengan imageUrl yang sudah diperbarui
            await updateService(id, {
                ...formUpdate,
                image: imageUrl,
            }, (res: any) => {
                toast.success('📝 Data berhasil diperbarui!', { id: updateToast });
                fetchData();
                onCloseUpdate();
                console.log(res);
            });

        } catch (error) {
            console.error('Gagal memperbarui produk:', error);
            toast.error('❌ Terjadi kesalahan saat memperbarui data.');
        }
    };




    console.log(formUpdate);
    console.log(services);

    return (
        <DefaultLayout>
            <div className="flex justify-between items-center mb-3">
                <h1 className='text-white'>Service</h1>
                <div className="">
                    <ButtonPrimary className='py-2 px-3 rounded-xl' onClick={onOpen}>Add Service</ButtonPrimary>
                </div>
            </div>

            <Table
                aria-label="Example table with client side pagination "
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                        />
                    </div>
                }
                classNames={{
                    wrapper: "min-h-[250px]",
                    th: 'bg-secondary text-white font-semibold',
                    td: 'text-black',
                }}
            >
                <TableHeader>
                    <TableColumn key="image">IMAGE</TableColumn>
                    <TableColumn key="name">NAME</TableColumn>
                    <TableColumn key="description">DESCRIPTION</TableColumn>
                    <TableColumn key="price">PRICE</TableColumn>
                    <TableColumn key="actions">ACTION</TableColumn>
                </TableHeader>
                <TableBody items={services}>
                    {(item: any) => (
                        <TableRow key={item._id}>
                            {(columnKey: any) => (
                                <TableCell>
                                    {columnKey === 'actions' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModalUpdate(item)}
                                                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                            >
                                                <RiEdit2Fill color='white' />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModalDelete(item._id)}
                                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                            >
                                                <FaTrash color='white' />
                                            </button>
                                        </div>
                                    )
                                        : columnKey === 'image' ? (
                                            <div>
                                                {item.image && <img src={item.image} className='w-12 h-12 object-cover rounded-full' />}
                                            </div>

                                        )

                                            : (
                                                getKeyValue(item, columnKey)
                                            )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate} className='w-full max-w-2xl ' closeButton={false} >
                <h1 className='text-black' >UPDATE SERVICE</h1>
                <div>
                    <div>
                        {formUpdate.image && formUpdate.image instanceof Blob ? (
                            <img
                                className="h-[150px] w-[150px] mx-auto object-cover border border-gray-400 rounded-lg"
                                src={URL.createObjectURL(formUpdate.image)}
                                alt="Preview"
                            />
                        ) : (
                            <img
                                className="h-[150px] w-[150px] mx-auto object-cover border border-gray-400 rounded-lg"
                                src={formUpdate.image}
                                alt="Preview"
                            />
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-input-update"
                            onChange={(e) => handleImageChange(e, 'update')}
                        />
                        <div className='flex justify-center items-center gap-2 mt-5'>
                            <ButtonPrimary className='border-2 border-black px-3 py-2 rounded-lg'
                                onClick={() => handleFileManager('update')}>Ubah Foto </ButtonPrimary>
                            <ButtonSecondary onClick={() => setFormUpdate({ ...formUpdate, image: null })} className=' px-3 py-2 rounded-lg' >Hapus Foto</ButtonSecondary>
                        </div>
                    </div>
                    <InputSecond
                        marginY='my-2'
                        title="Name"
                        htmlFor="name"
                        type="text"
                        className="w-full"
                        value={formUpdate.name}
                        onChange={handleChangeUpdate}
                    />
                    <InputSecond
                        marginY='my-2'
                        title="Description"
                        htmlFor="description"
                        type="text"
                        className="w-full"
                        value={formUpdate.description}
                        onChange={handleChangeUpdate}
                    />
                    <InputSecond
                        marginY='my-2'
                        title="Price"
                        htmlFor="price"
                        type="number"
                        className="w-full"
                        value={formUpdate.price}
                        onChange={handleChangeUpdate}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                        >
                            Save
                        </button>

                        <button
                            className="bg-red-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                            onClick={onCloseUpdate}
                        >
                            Close
                        </button>
                    </div>
                </div>

            </ModalDefault>
            <ModalDefault isOpen={isOpen} onClose={onClose} className='w-full max-w-2xl ' closeButton={false} >
                <h1 className='text-black' >CREATE SERVICE</h1>
                <form className="" onSubmit={handleCreate}>
                    <div>
                        {form.image && form.image instanceof Blob ? (
                            <img
                                className="h-[150px] w-[150px] mx-auto object-cover border border-gray-400 rounded-lg"
                                src={URL.createObjectURL(form.image)}
                                alt="Preview"
                            />
                        ) : (
                            <div className="h-[150px] w-[150px] mx-auto border border-gray-400 rounded-lg flex items-center justify-center bg-gray-100">
                                <CiCamera size={50} color="gray" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-input-add"
                            onChange={(e) => handleImageChange(e, 'add')}
                        />
                        <div className='flex justify-center items-center gap-2 mt-5'>
                            <ButtonPrimary className='border-2 border-black px-3 py-2 rounded-lg'
                                onClick={() => handleFileManager('add')}>Ubah Foto </ButtonPrimary>
                            <ButtonSecondary onClick={() => setForm({ ...form, image: null })} className=' px-3 py-2 rounded-lg' >Hapus Foto</ButtonSecondary>
                        </div>
                    </div>
                    <InputSecond
                        marginY='my-2'
                        title="Name"
                        htmlFor="name"
                        type="text"
                        className="w-full"
                        value={form.name}
                        onChange={handleChange}
                    />
                    <InputSecond
                        marginY='my-2'
                        title="Description"
                        htmlFor="description"
                        type="text"
                        className="w-full"
                        value={form.description}
                        onChange={handleChange}
                    />
                    <InputSecond
                        marginY='my-2'
                        title="Price"
                        htmlFor="price"
                        type="number"
                        className="w-full"
                        value={form.price}
                        onChange={handleChange}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type='submit'
                            className="bg-blue-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                        >
                            Save
                        </button>
                        <button
                            className="bg-red-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </form>
            </ModalDefault>
            <ModalAlert isOpen={isOpenDelete} onClose={onCloseDelete} closeButton={false} className='w-full max-w-2xl ' >
                <h1>Apakah anda yakin akan menghapus service ini ?</h1>
                <div className="flex justify-end gap-3">
                    <button className='bg-red-900  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={onCloseDelete}>Tidak</button>
                    <button className='bg-blue-500  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={handleDelete} >Ya</button>
                </div>
            </ModalAlert>
        </DefaultLayout>

    )
}

export default page