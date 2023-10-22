const express=require('express')
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
const storageconfig=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads') },
        filename:function(req,file,cb)
        {
            cb(null,Date.now()+'-'+file.originalname);
 }
});

const upload=multer({storage:storageconfig});
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
                res.redirect('/post')
        }
})

app.get('/posts',async function(req,res)
{
    const postdata=await db.getDb().collection('post').find().toArray();
    res.render('post',{posts:postdata})
})



app.post('/posts', upload.single('image'), async function (req, res) {
    const { title, content } = req.body;
    const image = req.file;
    
    const postdata = {
        title: title,
        content: content,
        imagePath: image.path
    };

    // Assuming you are using a MongoDB database
    
        await db.getDb().collection('post').insertOne(postdata);
        res.redirect('/addpost');
});


app.use(function(req,res)
{
    res.send("<h1>Sorry,Page is not found</h1>");
})


module.exports=app;

db.connectToDatabase().then(function () {
    app.listen(80);
  });
  
app.listen(80)