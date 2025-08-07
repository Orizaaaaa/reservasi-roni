'use client'
import { downloadDataCustomer, getAllReservation } from '@/api/method'
import ButtonPrimary from '@/elements/buttonPrimary'
import ButtonSecondary from '@/elements/buttonSecondary'
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout'
import { formatDate, formatDateStr } from '@/utils/helper'
import {
    Autocomplete,
    AutocompleteItem,
    DatePicker,
    getKeyValue,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@heroui/react'
import { parseDate } from '@internationalized/date'
import React, { useEffect } from 'react'

type Props = {}

const Page = (props: Props) => {
    const [data, setData] = React.useState<any[]>([])
    const [filteredData, setFilteredData] = React.useState<any[]>([])
    const [page, setPage] = React.useState(1)
    const [loading, setLoading] = React.useState(false)
    const rowsPerPage = 4

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const dateNow = new Date();
    const dateFirst = getFirstDayOfMonth(dateNow);

    const [dateStart, setDateStart] = React.useState(parseDate(formatDate(dateFirst)));
    const [endDateStart, setEndDateStart] = React.useState(parseDate(formatDate(dateNow)));

    const dataTipe = [
        { key: 'Semua', label: 'Semua', value: 'Semua' },
        { key: 'Menunggu', label: 'Menunggu', value: 'Menunggu' },
    ]

    const pages = Math.ceil(filteredData.length / rowsPerPage)

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredData.slice(start, end)
    }, [page, filteredData])

    // Fungsi untuk memfilter data berdasarkan tanggal
    const filterByDateRange = (data: any[], start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        return data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }

    // Ambil data dari API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const result = await getAllReservation()
            const filtered = result?.data?.filter((item: any) => item.status === 'Selesai') || []

            const formatted = filtered.map((item: any) => ({
                ...item,
                capster_name: item.capster_id?.username || '-',
                payment_name: item.payment_id?.name || '-',
                service_name: item.service_id?.name || '-',
                date_formatted: new Date(item.date).toLocaleDateString('id-ID'),
            }))

            setData(formatted)
            setLoading(false)
        }

        fetchData()
    }, [])

    // Filter data ketika tanggal berubah
    useEffect(() => {
        if (data.length > 0) {
            const start = dateStart.toString(); // Format: YYYY-MM-DD
            const end = endDateStart.toString(); // Format: YYYY-MM-DD
            const filtered = filterByDateRange(data, start, end);
            setFilteredData(filtered);
            setPage(1); // Reset ke halaman pertama saat filter berubah
        }
    }, [dateStart, endDateStart, data])

    const handleDowload = () => {
        downloadDataCustomer(formatDateStr(dateStart), formatDateStr(endDateStart), (result: any) => {
            const url = window.URL.createObjectURL(new Blob([result]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data_customer.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
    }

    return (
        <DefaultLayout>
            <Autocomplete
                placeholder="Filter"
                className="w-full border-2 border-primary rounded-lg"
            >
                {dataTipe.map((item) => (
                    <AutocompleteItem key={item.key} className="border-b border-secondary">
                        {item.label}
                    </AutocompleteItem>
                ))}
            </Autocomplete>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-5">
                <div className="col-span-1 md:col-span-2">
                    <DatePicker
                        onChange={(value) => value && setDateStart(value)}
                        value={dateStart}
                        className="w-full border-2 border-secondary rounded-lg"
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <DatePicker
                        onChange={(value) => value && setEndDateStart(value)}
                        value={endDateStart}
                        className="w-full border-2 border-secondary rounded-lg"
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <ButtonSecondary onClick={handleDowload} className="w-full h-full rounded-lg py-3 md:py-0">
                        Cetak Data
                    </ButtonSecondary>
                </div>
            </div>

            <Table
                aria-label="Tabel Booking"
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            page={page}
                            total={pages}
                            onChange={(p) => setPage(p)}
                        />
                    </div>
                }
                classNames={{
                    base: 'border-1 border-secondary rounded-lg',
                    wrapper: "min-h-[250px]",
                    th: 'bg-secondary text-white font-semibold',
                    td: 'text-black',
                }}
            >
                <TableHeader>
                    <TableColumn key="name">NAMA CUSTOMER</TableColumn>
                    <TableColumn key="phone">PHONE</TableColumn>
                    <TableColumn key="capster_name">CAPSTER</TableColumn>
                    <TableColumn key="date_formatted">TANGGAL</TableColumn>
                    <TableColumn key="hour">JAM</TableColumn>
                    <TableColumn key="payment_name">PEMBAYARAN</TableColumn>
                    <TableColumn key="haircut_type">HAIRCUT</TableColumn>
                </TableHeader>
                <TableBody items={items} isLoading={loading}>
                    {(item: any) => (
                        <TableRow key={item._id}>
                            {(columnKey: any) => (
                                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </DefaultLayout>
    )
}

export default Page