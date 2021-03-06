import express from "express";
import { UploadImage } from "../middleware/UploadImage.js";
import UserModel from "../models/UserModel.js";
import PemiluModel from "../models/PemiluModel.js";
import bcrypt from "bcrypt";
import moment from "moment";

const router = express.Router();

moment.locale('id')




// POST

router.post("/tambah-pemilihan", async(req, res) => {
  const { namaPemilihan, sifatPemilihan, waktuBerlangsung } = req.body;

  const waktunya = waktuBerlangsung.split(' - ');
  console.log(waktunya)
  const waktuAwal = new Date(waktunya[0])
  const waktuAkhir = new Date(waktunya[1])

  // console.log('waktu awal', waktuAwal.toLocaleString('id-ID'))
  // console.log('waktu akhir', waktuAkhir.toLocaleString('id-ID'))


  const pemilihan = {
    pemilik       : req.session.user._id,
    namaPemilihan : namaPemilihan,
    pemilihanTerbuka: (sifatPemilihan === 'terbuka' || false),
    waktuPelaksanaan: {
      awal: waktuAwal,
      akhir: waktuAkhir
    }
  }

  const response = await PemiluModel(pemilihan).save()

  // const response = {slug:'heheh'}

  res.redirect(`/dashboard/pemilihan/${response.slug}`)
 
 
 
  // PemiluModel.insertMany({
  //   pemilik       : req.session.user._id,
  //   namaPemilihan : namaPemilihan,
  //   pemilihanTerbuka: (sifatPemilihan === 'terbuka' || false)
  // })


  // res.send("ok");
});

router.post("/update-foto-profil", UploadImage, async (req, res) => {
  if (!req.file) res.status(404).json({ msg: "foto belum di upload" });
  const foto = req.file.path;
  await UserModel.findByIdAndUpdate(req.session.user._id, {
    foto: foto,
  });
  res.redirect("/dashboard/profile");
});

router.post("/ganti-sandi", async (req, res) => {
  const { sandiBaru, sandiLama } = req.body;

  if (sandiBaru === sandiLama) {
    res.status(406).json({ msg: "Sandi tidak berbeda" });
  }
  const cekSandiLama = await bcrypt.compare(
    sandiLama,
    req.session.user.password
  );
  if (!cekSandiLama) {
    res.status(406).json({ msg: "Sandi lama salah" });
  } else {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(sandiBaru, salt);
    await UserModel.findByIdAndUpdate(req.session.user._id, {
      password: passwordHash,
    });
    res.json({ msg: "sukses" });
  }
});

router.post("/update-profile", async (req, res) => {
  if (!req.session.auth && !req.session.user) {
    res.status(405).json({ msg: "Anda ilegal" });
  }

  const { nama, nohp } = req.body;
  await UserModel.findByIdAndUpdate(req.session.user._id, { nama, nohp });
  const response = await UserModel.findById(req.session.user._id);
  if (response) res.json({ msg: "sukses", nama: response.nama });
});

router.post("/sidebar", async (req, res) => {
  const { sidebar } = req.body;
  await UserModel.findByIdAndUpdate(req.session.user._id, { sidebar })
  res.json({ sidebar });
});

// PUT


// DELETE


// GET

router.get('/pemilihan/:slug', async(req,res)=>{
  const {slug} = req.params;

  // console.log(req.params.slug)

  const pemilihan = await PemiluModel.findOne({slug})

  if(!pemilihan) res.redirect('/404')

  const waktuAwal = moment(pemilihan.waktuPelaksanaan.awal).format('D MMMM YYYY [pukul] HH.mm').toString()
  const waktuAkhir = moment(pemilihan.waktuPelaksanaan.akhir).format('D MMMM YYYY [pukul] HH.mm').toString()


  pemilihan.waktuAwal = waktuAwal
  pemilihan.waktuAkhir = waktuAkhir

  console.log('awal',  pemilihan.waktuPelaksanaan.awal)
  console.log('akhir', waktuAkhir)
  // console.log(waktuAwal.format('D MMMM YYYY [pukul] HH.mm'))
  


  res.render("dashboard/pemilihan", {
    layout: "layouts/main-layout",
    user: req.session.user,
    pemilihan: req.session.pemilihan,
    pemilihanDisini: pemilihan
  });
})

router.get("/tambah-pemilihan", (req, res) => {
  res.render("dashboard/tambah-pemilihan", {
    layout: "layouts/main-layout",
    user: req.session.user,
    pemilihan: req.session.pemilihan
  });
});

router.get("/profile", (req, res) => {
  res.render("dashboard/profile", {
    layout: "layouts/main-layout",
    user: req.session.user,
    pemilihan: req.session.pemilihan
  });
});


router.get("/", (req, res) => {
  res.render("dashboard/dashboard", {
    layout: "layouts/main-layout",
    user: req.session.user,
    pemilihan: req.session.pemilihan
  });
});

// router.use('/', (req, res) => {
//   res.render('404', { layout: 'layouts/buangan' })
// })


export default router;
