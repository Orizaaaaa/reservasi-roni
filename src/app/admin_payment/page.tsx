'use client'
import { createPayment, deletePayment, getAllPayments, updatePayment } from '@/api/method';
import ButtonPrimary from '@/elements/buttonPrimary';
import InputSecond from '@/elements/input/InputSecond';
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout'
import ModalDefault from '@/fragments/modal/modal';
import ModalAlert from '@/fragments/modal/modalAlert';
import { users } from '@/utils/helper';
import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa6';
import { RiEdit2Fill } from 'react-icons/ri';

type Props = {}

function page({ }: Props) {
    const router = useRouter()
    const [id, setId] = React.useState('')
    const { onOpen, onClose, isOpen } = useDisclosure();
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();

    const [form, setForm]: any = React.useState({
        name: ''
    });
    const [payments, setPayments] = React.useState([])
    const fetchData = async () => {
        const data = await getAllPayments()
        setPayments(data?.data || [])
    }
    useEffect(() => {
        fetchData()
    }, []);

    const [page, setPage]: any = React.useState(1);
    const rowsPerPage = 4;

    const pages = Math.ceil(users.length / rowsPerPage);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev: { name: string }) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e: any) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error('⚠️ Nama pembayaran tidak boleh kosong!');
            return;
        }

        const createToast = toast.loading('Menyimpan data pembayaran...');

        try {
            await createPayment(form, (res: any) => {
                console.log(res);
                fetchData();
                onClose();
                setForm({ name: '' });
                toast.success('✅ Pembayaran berhasil ditambahkan!', { id: createToast });
            });
        } catch (error) {
            console.error(error);
            toast.error('❌ Gagal menambahkan pembayaran.', { id: createToast });
        }
    };


    const handleUpdate = async (e: any) => {
        e.preventDefault();
        const toastId = toast.loading('Menyimpan perubahan...');

        try {
            const result = await updatePayment(id, form);
            if (result) {
                toast.success('Template berhasil diperbarui!', { id: toastId });
                fetchData()
                onClose()
            } else {
                toast.error('Gagal memperbarui template.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat menyimpan.', { id: toastId });
        }
    };

    const openModalUpdate = (item: any) => {
        setId(item._id)
        setForm({
            name: item.name
        })
        onUpdateOpen()
        console.log('modal bos', item);
    }

    const openModalDelete = (item: any) => {
        setId(item._id)
        onWarningOpen()
    }

    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus Metode pembayaran...');
        try {
            const result = await deletePayment(id);
            if (result) {
                toast.success('Metode pembayaran berhasil dihapus!', { id: toastId });
                fetchData();
                onWarningClose();
            } else {
                toast.error('Gagal menghapus Metode pembayaran.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat menghapus.', { id: toastId });
        }
    };

    console.log(payments);

    return (
        <DefaultLayout>
            <div className="flex justify-between items-center mb-3">
                <h1 className='text-white'>PAYMENTS</h1>
                <div className="">
                    <ButtonPrimary className='py-2 px-3 rounded-xl' onClick={onOpen}>Add Payments</ButtonPrimary>
                </div>
            </div>

            <Table
                aria-label="Example table with client side pagination"
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
                    <TableColumn key="_id">ID</TableColumn>
                    <TableColumn key="name">NAME</TableColumn>
                    <TableColumn key="actions">AKSI</TableColumn>
                </TableHeader>
                <TableBody items={payments}>
                    {(item: any) => (
                        <TableRow key={item._id}>
                            {(columnKey: any) => (
                                <TableCell>
                                    {columnKey === 'actions' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModalUpdate(item)}
                                                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                            >
                                                <RiEdit2Fill color='white' />
                                            </button>
                                            <button
                                                onClick={() => openModalDelete(item)}
                                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                            >
                                                <FaTrash color='white' />
                                            </button>
                                        </div>
                                    ) : (
                                        getKeyValue(item, columnKey)
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>


            <ModalDefault isOpen={isOpen} onClose={onClose} className='w-full max-w-2xl ' closeButton={false} >
                <h1 >CREATE PAYMENTS</h1>
                <form className="" onSubmit={handleCreate}>
                    <InputSecond
                        bg='bg-slate-300'
                        styleTitle='text-black'
                        marginY='my-2'
                        title="Nama Pembayaran"
                        htmlFor="name"
                        type="text"
                        className="w-full"
                        value={form.name}
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

            <ModalDefault isOpen={isUpdateOpen} onClose={onUpdateClose} >
                <h1  >EDIT PAYMENTS</h1>
                <form className="" onSubmit={handleUpdate}>
                    <InputSecond
                        styleTitle='text-black'
                        marginY='my-2'
                        title="Nama Pembayaran"
                        htmlFor="name"
                        type="text"
                        bg='bg-slate-300'
                        className="w-full text-black"
                        value={form.name}
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

            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                apakah anda yakin akan menghapus metode pembayaran ini ?
                <div className="flex justify-end gap-3">
                    <button className='bg-red-900  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={onWarningClose}>Tidak</button>
                    <button className='bg-blue-500  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={handleDelete} >Ya</button>
                </div>
            </ModalAlert>
        </DefaultLayout>

    )
}

export default page