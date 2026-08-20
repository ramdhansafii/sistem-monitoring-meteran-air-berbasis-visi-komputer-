import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Camera,
  X
} from 'lucide-react';

import { api, API_BASE } from '../api/client';

import {
  format,
  subMonths,
  addMonths
} from 'date-fns';

import { id } from 'date-fns/locale';


const STATUS_COLOR = {
  Tinggi: '#ff6b6b',
  Normal: 'var(--accent-cyan)',
  Rendah: 'var(--accent-green)'
};


// ======================================================
// TOOLTIP GRAFIK
// ======================================================

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glow)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginBottom: '4px'
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: '18px',
            color: 'var(--accent-cyan)',
            fontWeight: '700'
          }}
        >
          {payload[0].value} m³
        </div>
      </div>
    );
  }

  return null;
};


// ======================================================
// URL FOTO
// ======================================================

function getImageUrl(imagePath) {

  if (!imagePath) {
    return null;
  }

  // Jika API sudah memberikan URL lengkap
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  ) {
    return imagePath;
  }

  // Hilangkan slash di awal
  const cleanPath = imagePath.replace(/^\/+/, '');

  // Jika path sudah mengandung alamat API
  if (cleanPath.startsWith(API_BASE.replace(/^https?:\/\//, ''))) {
    return imagePath;
  }

  return `${API_BASE}/${cleanPath}`;
}


// ======================================================
// HALAMAN RIWAYAT
// ======================================================

export default function RiwayatPage({ data }) {

  const [filter, setFilter] = useState('semua');

  const [search, setSearch] = useState('');

  const [sortDir, setSortDir] = useState('asc');

  const [monthData, setMonthData] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Foto yang sedang dibuka
  const [selectedImage, setSelectedImage] = useState(null);


  // ======================================================
  // AMBIL DATA RIWAYAT
  // ======================================================

  useEffect(() => {

    api.getHistory(
      selectedMonth.getMonth() + 1,
      selectedMonth.getFullYear()
    )

      .then((r) => {

        if (!r?.readings) {
          setMonthData([]);
          return;
        }


        // Urutkan berdasarkan tanggal dan waktu
        const sorted = [...r.readings].sort(
          (a, b) =>
            new Date(a.reading_date) -
            new Date(b.reading_date)
        );


        // Bentuk data untuk tabel
        const mapped = sorted.map((rd, index) => {

          const d = new Date(rd.reading_date);


          // Nilai pembacaan saat ini
          const current = Number(rd.reading);


          // Nilai pembacaan sebelumnya
          const previous =
            index > 0
              ? Number(sorted[index - 1].reading)
              : current;


          // Pemakaian
          const usage = Number(Math.max(0, current - previous).toFixed(5));


          // Status
          let status = 'Normal';

          if (usage > 3) {
            status = 'Tinggi';
          } else if (usage < 1) {
            status = 'Rendah';
          }


          /*
           * Ambil lokasi foto dari backend.
           *
           * Beberapa kemungkinan nama field:
           * image_path
           * imagePath
           * image
           * photo
           */
          const imagePath =
            rd.image_path ||
            rd.imagePath ||
            rd.image ||
            rd.photo ||
            null;


          return {

            // Tanggal asli untuk sorting
            rawDate: d,

            // Tanggal
            date: format(
              d,
              'dd MMM yyyy',
              { locale: id }
            ),

            // Jam pembacaan
            time: format(
              d,
              'HH:mm:ss'
            ),

            // Tanggal pendek untuk grafik
            shortDate: format(
              d,
              'dd MMM',
              { locale: id }
            ),

            // Hari
            day: format(
              d,
              'EEEE',
              { locale: id }
            ),

            // Pemakaian
            usage,

            // Kumulatif
            cumulative: current,

            // Status
            status,

            // Foto
            imagePath,

            // URL foto siap digunakan
            imageUrl: getImageUrl(imagePath),

            // ID pembacaan
            readingId: rd.id

          };

        });


        setMonthData(mapped);

      })

      .catch((error) => {

        console.error(
          'Gagal mengambil riwayat:',
          error
        );

        setMonthData([]);

      });

  }, [selectedMonth]);


  // ======================================================
  // STATISTIK
  // ======================================================

  const avg = useMemo(

    () =>

      monthData.length

        ? (

          monthData.reduce(
            (a, b) => a + b.usage,
            0
          ) / monthData.length

        ).toFixed(1)

        : 0,

    [monthData]

  );


  const max = useMemo(

    () =>

      monthData.length

        ? Math.max(
          ...monthData.map(
            d => d.usage
          )
        )

        : 0,

    [monthData]

  );


  const min = useMemo(

    () =>

      monthData.length

        ? Math.min(
          ...monthData.map(
            d => d.usage
          )
        )

        : 0,

    [monthData]

  );


  // ======================================================
  // FILTER DAN SORT
  // ======================================================

  const filtered = useMemo(() => {

    let d = [...monthData];


    // Filter status
    if (filter !== 'semua') {

      d = d.filter(
        x =>
          x.status.toLowerCase() ===
          filter
      );

    }


    // Search tanggal
    if (search) {

      d = d.filter(
        x =>
          x.date
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    }


    // Sorting
    if (sortDir === 'asc') {

      d.sort(
        (a, b) =>
          a.rawDate - b.rawDate
      );

    }

    else if (sortDir === 'desc') {

      d.sort(
        (a, b) =>
          b.rawDate - a.rawDate
      );

    }


    return d;

  }, [
    monthData,
    filter,
    search,
    sortDir
  ]);


  // ======================================================
  // DATA GRAFIK
  // ======================================================

  const chartData = monthData.map(
    d => ({
      ...d,
      label: d.shortDate
    })
  );


  // ======================================================
  // EXPORT CSV
  // ======================================================

  const downloadCSV = () => {

    const header =
      'Tanggal,Jam Pembacaan,Hari,Pemakaian (m³),Kumulatif (m³),Status\n';


    const rows = monthData

      .map(
        d =>
          `${d.date},${d.time},${d.day},${d.usage},${d.cumulative},${d.status}`
      )

      .join('\n');


    const blob = new Blob(
      [
        header + rows
      ],
      {
        type: 'text/csv'
      }
    );


    const url =
      URL.createObjectURL(blob);


    const a =
      document.createElement('a');


    a.href = url;


    a.download =
      `history-pemakaian-${format(
        selectedMonth,
        'MM-yyyy'
      )}.csv`;


    a.click();


    URL.revokeObjectURL(url);

  };


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          marginBottom: '24px',
          animation:
            'fadeIn 0.5s ease',

          display: 'flex',

          justifyContent:
            'space-between',

          alignItems:
            'flex-start',

          flexWrap:
            'wrap',

          gap: '16px'
        }}
      >

        <div>

          <div
            style={{
              fontSize: '10px',
              color:
                'var(--text-muted)',

              letterSpacing:
                '0.15em',

              textTransform:
                'uppercase',

              fontFamily:
                'var(--font-mono)',

              marginBottom:
                '6px'
            }}
          >
            Rekam Jejak
          </div>


          <h1
            style={{
              fontFamily:
                'var(--font-display)',

              fontSize: '18px',

              fontWeight: '700',

              color:
                'var(--text-primary)'
            }}
          >
            Riwayat Pemakaian
          </h1>


          <p
            style={{
              fontSize: '12px',

              color:
                'var(--text-secondary)',

              marginTop: '4px'
            }}
          >
            Pantau dan analisis histori konsumsi air Anda
          </p>

        </div>


        {/* ==================================================
            MONTH SELECTOR
        ================================================== */}

        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: '12px',

            background:
              'var(--bg-card)',

            border:
              '1px solid var(--border)',

            borderRadius:
              '12px',

            padding:
              '6px 12px'
          }}
        >

          <button

            onClick={() =>
              setSelectedMonth(
                subMonths(
                  selectedMonth,
                  1
                )
              )
            }

            style={{
              background:
                'transparent',

              border:
                'none',

              color:
                'var(--text-secondary)',

              cursor:
                'pointer',

              display:
                'flex',

              padding:
                '4px'
            }}
          >

            <ChevronLeft size={16} />

          </button>


          <div
            style={{
              fontFamily:
                'var(--font-mono)',

              fontSize:
                '12px',

              fontWeight:
                '700',

              color:
                'var(--text-primary)',

              minWidth:
                '90px',

              textAlign:
                'center'
            }}
          >
            {format(
              selectedMonth,
              'MMMM yyyy',
              { locale: id }
            )}
          </div>


          <button

            onClick={() =>
              setSelectedMonth(
                addMonths(
                  selectedMonth,
                  1
                )
              )
            }

            style={{
              background:
                'transparent',

              border:
                'none',

              color:
                'var(--text-secondary)',

              cursor:
                'pointer',

              display:
                'flex',

              padding:
                '4px'
            }}
          >

            <ChevronRight size={16} />

          </button>

        </div>

      </div>


      {/* ==================================================
          SUMMARY STATS
      ================================================== */}

      <div
        style={{
          display:
            'grid',

          gridTemplateColumns:
            'repeat(2, 1fr)',

          gap:
            '10px',

          marginBottom:
            '16px'
        }}
      >

        {/* Rata-rata */}

        <div style={statCardStyle}>

          <div style={statLabelStyle}>
            Rata-rata Harian
          </div>

          <div
            style={{
              fontFamily:
                'var(--font-display)',

              fontSize:
                '20px',

              color:
                'var(--accent-cyan)'
            }}
          >

            {avg}

            <span
              style={{
                fontSize:
                  '11px',

                color:
                  'var(--text-secondary)'
              }}
            >
              {' '}m³
            </span>

          </div>

        </div>


        {/* Tertinggi */}

        <div style={statCardStyle}>

          <div style={statLabelStyle}>
            Tertinggi
          </div>

          <div
            style={{
              fontFamily:
                'var(--font-display)',

              fontSize:
                '20px',

              color:
                '#ff6b6b',

              display:
                'flex',

              alignItems:
                'center',

              gap:
                '6px'
            }}
          >

            {max}

            <TrendingUp size={14} />

          </div>

        </div>


        {/* Terendah */}

        <div style={statCardStyle}>

          <div style={statLabelStyle}>
            Terendah
          </div>

          <div
            style={{
              fontFamily:
                'var(--font-display)',

              fontSize:
                '20px',

              color:
                'var(--accent-green)',

              display:
                'flex',

              alignItems:
                'center',

              gap:
                '6px'
            }}
          >

            {min}

            <TrendingDown size={14} />

          </div>

        </div>


        {/* Total */}

        <div style={statCardStyle}>

          <div style={statLabelStyle}>
            Total Bulan
          </div>

          <div
            style={{
              fontFamily:
                'var(--font-display)',

              fontSize:
                '20px',

              color:
                'var(--accent-teal)'
            }}
          >

             {monthData.reduce((a, b) => a + b.usage, 0).toFixed(5)}

            <span
              style={{
                fontSize:
                  '11px',

                color:
                  'var(--text-secondary)'
              }}
            >
              {' '}m³
            </span>

          </div>

        </div>

      </div>


      {/* ==================================================
          LINE CHART
      ================================================== */}

      <div
        style={{
          background:
            'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',

          border:
            '1px solid var(--border)',

          borderRadius:
            '16px',

          padding:
            '16px',

          marginBottom:
            '16px',

          animation:
            'fadeIn 0.5s ease 0.25s both'
        }}
      >

        <div
          style={{
            display:
              'flex',

            justifyContent:
              'space-between',

            alignItems:
              'center',

            marginBottom:
              '12px',

            flexWrap:
              'wrap',

            gap:
              '8px'
          }}
        >

          <div
            style={{
              fontFamily:
                'var(--font-mono)',

              fontSize:
                '11px',

              fontWeight:
                '700',

              color:
                'var(--text-primary)'
            }}
          >
            Grafik Pemakaian — 14 Hari Terakhir
          </div>


          <button

            onClick={
              downloadCSV
            }

            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                '6px',

              padding:
                '6px 12px',

              background:
                'rgba(0,212,255,0.08)',

              border:
                '1px solid var(--border-glow)',

              borderRadius:
                '8px',

              color:
                'var(--accent-cyan)',

              cursor:
                'pointer',

              fontSize:
                '10px',

              fontFamily:
                'var(--font-body)'
            }}
          >

            <Download size={10} />

            Export CSV

          </button>

        </div>


        <ResponsiveContainer
          width="100%"
          height={160}
        >

          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              bottom: 0,
              left: -20
            }}
          >

            <defs>

              <linearGradient
                id="lineGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="var(--accent-cyan)"
                  stopOpacity={0.15}
                />

                <stop
                  offset="100%"
                  stopColor="var(--accent-cyan)"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>


            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
            />


            <XAxis
              dataKey="label"
              tick={{
                fill:
                  'var(--text-secondary)',

                fontSize:
                  9,

                fontFamily:
                  'Space Mono'
              }}
              axisLine={false}
              tickLine={false}
            />


            <YAxis
              tick={{
                fill:
                  'var(--text-secondary)',

                fontSize:
                  9,

                fontFamily:
                  'Space Mono'
              }}
              axisLine={false}
              tickLine={false}
            />


            <Tooltip
              content={
                <CustomTooltip />
              }
            />


            <Line
              type="monotone"
              dataKey="usage"
              stroke="var(--accent-cyan)"
              strokeWidth={2}
              fill="url(#lineGrad)"
              dot={{
                fill:
                  'var(--accent-cyan)',
                r: 3
              }}
              activeDot={{
                r: 5,
                fill:
                  'var(--text-primary)',
                stroke:
                  'var(--accent-cyan)',
                strokeWidth: 2
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>


      {/* ==================================================
          FILTER
      ================================================== */}

      <div
        style={{
          display:
            'flex',

          gap:
            '8px',

          alignItems:
            'center',

          marginBottom:
            '12px',

          flexWrap:
            'wrap'
        }}
      >

        <div
          style={{
            display:
              'flex',

            alignItems:
              'center',

            gap:
              '4px',

            color:
              'var(--text-muted)',

            fontSize:
              '11px'
          }}
        >

          <Filter size={11} />

          <span
            style={{
              fontFamily:
                'var(--font-mono)'
            }}
          >
            Filter:
          </span>

        </div>


        {[
          'semua',
          'tinggi',
          'normal',
          'rendah'
        ].map(f => (

          <button

            key={f}

            onClick={() =>
              setFilter(f)
            }

            style={{
              padding:
                '4px 12px',

              borderRadius:
                '20px',

              fontSize:
                '10px',

              fontFamily:
                'var(--font-body)',

              cursor:
                'pointer',

              background:
                filter === f
                  ? 'rgba(0,212,255,0.12)'
                  : 'transparent',

              border:
                filter === f
                  ? '1px solid var(--border-glow)'
                  : '1px solid var(--border)',

              color:
                filter === f
                  ? 'var(--accent-cyan)'
                  : 'var(--text-secondary)',

              transition:
                'all 0.2s',

              textTransform:
                'capitalize'
            }}
          >

            {f}

          </button>

        ))}


        <div
          style={{
            flex: 1
          }}
        />


        {/* Search */}

        <div
          style={{
            display:
              'flex',

            alignItems:
              'center',

            gap:
              '6px',

            background:
              'rgba(0,0,0,0.1)',

            border:
              '1px solid var(--border)',

            borderRadius:
              '8px',

            padding:
              '5px 10px'
          }}
        >

          <Calendar
            size={10}
            color="var(--text-secondary)"
          />

          <input

            placeholder="Cari..."

            value={search}

            onChange={
              e =>
                setSearch(
                  e.target.value
                )
            }

            style={{
              background:
                'transparent',

              border:
                'none',

              outline:
                'none',

              color:
                'var(--text-primary)',

              fontSize:
                '10px',

              fontFamily:
                'var(--font-mono)',

              width:
                '80px'
            }}

          />

        </div>


        {/* Sorting */}

        <button

          onClick={() =>
            setSortDir(
              d =>
                d === 'desc'
                  ? 'asc'
                  : 'desc'
            )
          }

          style={{
            padding:
              '5px 10px',

            background:
              'rgba(122,111,255,0.08)',

            border:
              '1px solid rgba(122,111,255,0.2)',

            borderRadius:
              '8px',

            color:
              'var(--accent-teal)',

            fontSize:
              '10px',

            cursor:
              'pointer',

            fontFamily:
              'var(--font-mono)'
          }}
        >

          {
            sortDir === 'desc'
              ? '↓ Terbesar'
              : '↑ Terkecil'
          }

        </button>

      </div>


      {/* ==================================================
          TABEL RIWAYAT PEMAKAIAN
      ================================================== */}

      <div
        style={{
          background:
            'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',

          border:
            '1px solid var(--border)',

          borderRadius:
            '16px',

          overflow:
            'hidden',

          animation:
            'fadeIn 0.5s ease 0.35s both',

          overflowX:
            'auto'
        }}
      >

        <table
          style={{
            width:
              '100%',

            borderCollapse:
              'collapse',

            minWidth:
              '950px'
          }}
        >

          {/* ===============================
              HEADER TABEL
          =============================== */}

          <thead>

            <tr
              style={{
                borderBottom:
                  '1px solid var(--border)'
              }}
            >

              {[
                'Tanggal',
                'Jam Pembacaan',
                'Hari',
                'Pemakaian',
                'Kumulatif',
                'Status',
                'Foto Meteran'
              ].map(h => (

                <th
                  key={h}

                  style={{
                    padding:
                      '10px 12px',

                    textAlign:
                      'left',

                    fontSize:
                      '9px',

                    color:
                      'var(--text-muted)',

                    fontFamily:
                      'var(--font-mono)',

                    letterSpacing:
                      '0.1em',

                    textTransform:
                      'uppercase',

                    fontWeight:
                      '400',

                    whiteSpace:
                      'nowrap'
                  }}
                >

                  {h}

                </th>

              ))}

            </tr>

          </thead>


          {/* ===============================
              ISI TABEL
          =============================== */}

          <tbody>

            {filtered.length === 0 ? (

              <tr>

                <td
                  colSpan="7"

                  style={{
                    padding:
                      '40px 20px',

                    textAlign:
                      'center',

                    color:
                      'var(--text-muted)',

                    fontSize:
                      '11px',

                    fontFamily:
                      'var(--font-mono)'
                  }}
                >

                  Belum terdapat data pembacaan meter.

                </td>

              </tr>

            ) : (

              filtered.map(
                (row, i) => (

                  <tr
                    key={
                      row.readingId ||
                      i
                    }

                    style={{
                      borderBottom:
                        '1px solid var(--border)',

                      transition:
                        'background 0.2s',

                      animation:
                        `fadeIn 0.3s ease ${i * 0.02}s both`
                    }}

                    onMouseEnter={
                      e =>
                        e.currentTarget.style.background =
                        'var(--bg-card-hover)'
                    }

                    onMouseLeave={
                      e =>
                        e.currentTarget.style.background =
                        'transparent'
                    }
                  >

                    {/* TANGGAL */}

                    <td
                      style={{
                        padding:
                          '10px 12px',

                        fontSize:
                          '11px',

                        fontFamily:
                          'var(--font-mono)',

                        color:
                          'var(--text-primary)',

                        whiteSpace:
                          'nowrap'
                      }}
                    >

                      {row.date}

                    </td>


                    {/* JAM */}

                    <td
                      style={{
                        padding:
                          '10px 12px',

                        fontSize:
                          '11px',

                        fontFamily:
                          'var(--font-mono)',

                        color:
                          'var(--accent-cyan)',

                        whiteSpace:
                          'nowrap'
                      }}
                    >

                      {row.time}

                    </td>


                    {/* HARI */}

                    <td
                      style={{
                        padding:
                          '10px 12px',

                        fontSize:
                          '11px',

                        color:
                          'var(--text-secondary)',

                        whiteSpace:
                          'nowrap'
                      }}
                    >

                      {row.day}

                    </td>


                    {/* PEMAKAIAN */}

                    <td
                      style={{
                        padding:
                          '10px 12px',

                        fontFamily:
                          'var(--font-display)',

                        fontSize:
                          '14px',

                        color:
                          'var(--accent-cyan)',

                        whiteSpace:
                          'nowrap'
                      }}
                    >

                      {row.usage}

                      <span
                        style={{
                          fontSize:
                            '9px',

                          color:
                            'var(--text-muted)',

                          marginLeft:
                            '4px'
                        }}
                      >
                        m³
                      </span>

                    </td>


                    {/* KUMULATIF */}

                    <td
                      style={{
                        padding:
                          '10px 12px',

                        fontFamily:
                          'var(--font-mono)',

                        fontSize:
                          '11px',

                        color:
                          'var(--text-secondary)',

                        whiteSpace:
                          'nowrap'
                      }}
                    >

                      {row.cumulative} m³

                    </td>


                    {/* STATUS */}

                    <td
                      style={{
                        padding:
                          '10px 12px'
                      }}
                    >

                      <span
                        style={{
                          padding:
                            '2px 8px',

                          borderRadius:
                            '20px',

                          fontSize:
                            '9px',

                          fontFamily:
                            'var(--font-mono)',

                          background:
                            `${STATUS_COLOR[
                            row.status
                            ] ||
                            '#ff6b6b'
                            }18`,

                          border:
                            `1px solid ${STATUS_COLOR[
                            row.status
                            ] ||
                            '#ff6b6b'
                            }40`,

                          color:
                            STATUS_COLOR[
                            row.status
                            ] ||
                            '#ff6b6b'
                        }}
                      >

                        {row.status}

                      </span>

                    </td>


                    {/* FOTO METERAN */}

                    <td
                      style={{
                        padding:
                          '8px 12px'
                      }}
                    >

                      {row.imageUrl ? (

                        <div
                          style={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              '8px'
                          }}
                        >

                          {/* Thumbnail */}

                          <img

                            src={
                              row.imageUrl
                            }

                            alt="Capture meteran"

                            onClick={() =>
                              setSelectedImage(
                                row.imageUrl
                              )
                            }

                            onError={
                              e => {
                                e.currentTarget.style.display =
                                  'none';
                              }
                            }

                            style={{
                              width:
                                '70px',

                              height:
                                '48px',

                              objectFit:
                                'cover',

                              borderRadius:
                                '6px',

                              border:
                                '1px solid var(--border-glow)',

                              cursor:
                                'pointer',

                              background:
                                'var(--bg-secondary)'
                            }}

                          />


                          {/* Tombol lihat */}

                          <button

                            onClick={() =>
                              setSelectedImage(
                                row.imageUrl
                              )
                            }

                            style={{
                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap:
                                '4px',

                              padding:
                                '5px 8px',

                              background:
                                'rgba(0,212,255,0.08)',

                              border:
                                '1px solid var(--border-glow)',

                              borderRadius:
                                '6px',

                              color:
                                'var(--accent-cyan)',

                              cursor:
                                'pointer',

                              fontSize:
                                '9px',

                              fontFamily:
                                'var(--font-mono)',

                              whiteSpace:
                                'nowrap'
                            }}
                          >

                            <Camera
                              size={10}
                            />

                            Lihat

                          </button>

                        </div>

                      ) : (

                        <span
                          style={{
                            fontSize:
                              '9px',

                            color:
                              'var(--text-muted)',

                            whiteSpace:
                              'nowrap'
                          }}
                        >

                          Tidak tersedia

                        </span>

                      )}

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>


        {/* FOOTER */}

        <div
          style={{
            padding:
              '10px 12px',

            borderTop:
              '1px solid var(--border)',

            fontSize:
              '9px',

            color:
              'var(--text-muted)',

            fontFamily:
              'var(--font-mono)'
          }}
        >

          Menampilkan {filtered.length} dari {monthData.length} entri bulan ini

        </div>

      </div>


      {/* ==================================================
          POPUP / PREVIEW FOTO
      ================================================== */}

      {selectedImage && (

        <div

          onClick={() =>
            setSelectedImage(null)
          }

          style={{
            position:
              'fixed',

            inset:
              0,

            zIndex:
              9999,

            background:
              'rgba(0,0,0,0.85)',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            padding:
              '20px'
          }}
        >

          <div

            onClick={
              e =>
                e.stopPropagation()
            }

            style={{
              position:
                'relative',

              maxWidth:
                '900px',

              maxHeight:
                '90vh',

              background:
                'var(--bg-card)',

              border:
                '1px solid var(--border-glow)',

              borderRadius:
                '14px',

              padding:
                '12px',

              boxShadow:
                '0 0 40px rgba(0,212,255,0.2)'
            }}
          >

            {/* CLOSE */}

            <button

              onClick={() =>
                setSelectedImage(null)
              }

              style={{
                position:
                  'absolute',

                top:
                  '10px',

                right:
                  '10px',

                width:
                  '32px',

                height:
                  '32px',

                borderRadius:
                  '50%',

                border:
                  '1px solid var(--border)',

                background:
                  'rgba(0,0,0,0.75)',

                color:
                  '#fff',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                cursor:
                  'pointer',

                zIndex:
                  2
              }}
            >

              <X size={16} />

            </button>


            {/* FOTO BESAR */}

            <img

              src={
                selectedImage
              }

              alt="Hasil Capture Meteran"

              style={{
                display:
                  'block',

                maxWidth:
                  '100%',

                maxHeight:
                  '80vh',

                objectFit:
                  'contain',

                borderRadius:
                  '8px'
              }}

            />


            {/* KETERANGAN */}

            <div
              style={{
                marginTop:
                  '8px',

                textAlign:
                  'center',

                fontSize:
                  '10px',

                color:
                  'var(--text-secondary)',

                fontFamily:
                  'var(--font-mono)'
              }}
            >

              Hasil Capture Meteran

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


// ======================================================
// STYLE STAT CARD
// ======================================================

const statCardStyle = {

  background:
    'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',

  border:
    '1px solid var(--border)',

  borderRadius:
    '12px',

  padding:
    '14px',

  animation:
    'fadeIn 0.5s ease 0.05s both'

};


const statLabelStyle = {

  fontSize:
    '10px',

  color:
    'var(--text-muted)',

  fontFamily:
    'var(--font-mono)',

  marginBottom:
    '6px'

};