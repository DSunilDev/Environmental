const express=require('express')
const fs=require('fs')
const path=require('path')
const bcry=require('bcryptjs')
const multer = require('multer');

const db=require('./DATABASE/database');
const app=express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static('styles'));

app.use(express.static('uploads')); 

//Multer 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Relative path to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: storage });

app.use('/uploads',express.static('uploads'))

app.use(express.urlencoded({extended:true}))

app.get('/',function(req,res)
{
    res.render('index'); 
})

app.get('/Home',function(req,res)
{
    res.render('index');
})

app.get('/Overview',function(req,res){
    res.render('overview')
})

app.get('/Contact',function(req,res)
{
    res.render('contact');
})

app.get('/Donate',function(req,res)
{
    res.render('donate');
})

app.get('/Credits',function(req,res)
{
    res.render('credits');
})

app.get('/signup',function(req,res)
{
    res.render('signup')
})

app.get('/login',function(req,res)
{
    res.render('login')
})

app.get('/addpost',function(req,res)
{
    res.render('addpost')
} )

app.post('/signup',async function(req,res)
{
    const userdata=req.body;
    const email=userdata.mail;
    const password=userdata.password;
    const existingdata=await db.getDb().collection('users').findOne({mail:email});

    if(existingdata)
    {
        res.redirect('/login')
    }else
    {
    const hashedpassword=await bcry.hash(password,12);

    const users={
        mail:email,
        password:hashedpassword,
    };

    await db.getDb().collection('users').insertOne(users);
    res.redirect('/login')
}
})

app.post('/login',async function(req,res)
{
    const userdata=req.body;
    const email=userdata.mail;
    const password=userdata.password;

    const existingdata=await db.getDb().collection('users').findOne({mail:email});

    if(!existingdata)
    {
        res.redirect('/signup')
    }
        const passwordEqual=await bcry.compare(password,existingdata.password)
        
        if(!passwordEqual)
        {
            res.redirect('/login')
            console.log("Wrong Password")
        }else{
                res.redirect('/addpost')
        }
})

app.get('/posts',async function(req,res)
{
    const postdata=await db.getDb().collection('post').find().toArray();
    res.render('post',{posts:postdata})
})

app.post('/posts', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, classification, family, subfamily, tribe, genus, taxon, synonyms, englishName, tamilName, habit, leaf, inflorescence, spiklets, caryopsis, floweringPeriod, fruitingPeriod, habitat, distributionTamilnadu, distributionAbr, fieldNotes, occurrence, uses, iucnStatus, keyReference } = req.body;
        const images = req.files;

        const postdata = {
            title: title,
            classification: classification,
            family: family,
            subfamily: subfamily,
            tribe: tribe,
            genus: genus,
            taxon: taxon,
            synonyms: synonyms,
            englishName: englishName,
            tamilName: tamilName,
            habit: habit,
            leaf: leaf,
            inflorescence: inflorescence,
            spiklets: spiklets,
            caryopsis: caryopsis,
            floweringPeriod: floweringPeriod,
            fruitingPeriod: fruitingPeriod,
            habitat: habitat,
            distributionTamilnadu: distributionTamilnadu,
            distributionAbr: distributionAbr,
            fieldNotes: fieldNotes,
            occurrence: occurrence,
            uses: uses,
            iucnStatus: iucnStatus,
            keyReference: keyReference,

            // Assuming you want to store the paths of both images in an array
            imagePaths: [images['image1'][0].path, images['image2'][0].path]
        };

        // Assuming you are using a MongoDB database
        await db.getDb().collection('post').insertOne(postdata);
        res.redirect('/addpost');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/sitemap', function(req, res) {
    // Assuming 'sitemap.xml' is in the root directory of your project
    const filePath = __dirname + '/sitemap.xml';
    
    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            console.error('Error reading sitemap.xml:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.set('Content-Type', 'application/xml');
            res.send(data);
        }
    });
});


app.use(function(req,res)
{
    res.send("<h1>Sorry,Page is not found</h1>");
})


module.exports=app;

db.connectToDatabase().then(function () {
    app.listen(80);
  });
  
app.listen(500)