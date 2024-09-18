import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;
const API_url = "https://kitsu.io/api/edge";
const anime_list = 13552;

//This allows use to use the static files in the public folder
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended : true}));

//This renders the hompage
app.get("/", (req, res) => {
        res.render("index.ejs");
});

app.get("/getRecommendation", async (req, res)=> {
    const diffId = Math.floor(Math.random() * anime_list);
    console.log(diffId);
    try {
        const response = await axios.get(API_url+"/anime/" + diffId);
        const dataPack = response.data.data;
        res.render("getRecommendation.ejs", 
            {
                show_name_en : dataPack.attributes.canonicalTitle,
                show_name_jap : dataPack.attributes.titles.en_jp,
                show_name_ja_jp : dataPack.attributes.titles.ja_jp,
                subType : dataPack.attributes.subtype,
                show_status : dataPack.attributes.status,
                ageRating : dataPack.attributes.ageRating,
                coverImage : dataPack.attributes.posterImage.large,
                desc : dataPack.attributes.description,
                epiCount : dataPack.attributes.episodeCount,
                startDate : dataPack.attributes.startDate,
            }
    );
    } 
    catch (error) {
        console.error("Error: ", error.response ? error.response.data : error.message);
        console.log("Couldn't fetch data. No data with this ID: " + diffId);
        res.redirect("/");
    }
});

//Receives the data from the search input and uses it as the value needed for the search input
app.post("/search", async (req, res) => {
    const searchQuery = req.body.searchQuery;
    console.log(searchQuery);
    try {
        const response = await axios.get(API_url + "/anime?filter[text]=" + searchQuery);
        const dataPack = response.data.data;
        const animeArray = dataPack.map(anime => ({
            show_name_en: anime.attributes.canonicalTitle,
            show_name_jap: anime.attributes.titles.en_jp,
            show_name_ja_jp: anime.attributes.titles.ja_jp,
            subType: anime.attributes.subtype,
            show_status: anime.attributes.status,
            ageRating: anime.attributes.ageRating,
            coverImage: anime.attributes.posterImage.original,
            desc: anime.attributes.description,
            epiCount: anime.attributes.episodeCount,
            startDate: anime.attributes.startDate,
        }));
        res.render("search.ejs", { animeArray });
    } 
    catch (error) {
        console.error("Error: ", error.response ? error.response.data : error.message);
        console.log("Couldn't fetch data. No data with this ID: " + searchQuery);
        res.redirect("/");
    }
});

app.get("/browse", async (req, res) => {
    const pageLimit = Number(req.query.pageLimit) || 16;
    const pageOffset = Math.max(Number(req.query.pageOffset) || 0, 0);
    try {
        const response = await axios.get(API_url + "/anime?page[limit]="+pageLimit+"&page[offset]="+pageOffset);
        const dataPack = response.data.data;
        const browseArray = dataPack.map(anime => ({
            show_name_en: anime.attributes.canonicalTitle,
            show_name_jap: anime.attributes.titles.en_jp,
            show_name_ja_jp: anime.attributes.titles.ja_jp,
            subType: anime.attributes.subtype,
            show_status: anime.attributes.status,
            ageRating: anime.attributes.ageRating,
            coverImage: anime.attributes.posterImage.original,
            startDate: anime.attributes.startDate,
            showId: anime.id 
        }));
        res.render("browse.ejs", { browseArray, pageLimit, pageOffset });
    } catch (error) {
        console.error("Error: ", error.response ? error.response.data : error.message);
        console.log(error);
        res.redirect("/browse");
    }
});

app.post("/viewShow", async (req, res)=> {
    const showId = req.body.showId;
    try {
        const response = await axios.get(API_url + "/anime/" + showId);
        const dataPack = response.data.data;
        res.render("viewShow.ejs", {
            show_name_en : dataPack.attributes.canonicalTitle,
            show_name_jap : dataPack.attributes.titles.en_jp,
            show_name_ja_jp : dataPack.attributes.titles.ja_jp,
            subType : dataPack.attributes.subtype,
            show_status : dataPack.attributes.status,
            ageRating : dataPack.attributes.ageRating,
            coverImage : dataPack.attributes.posterImage.large,
            desc : dataPack.attributes.description,
            epiCount : dataPack.attributes.episodeCount,
            startDate : dataPack.attributes.startDate,
        });
    } 
    catch (error) {
        console.error("Error: ", error.response ? error.response.data : error.message);
        console.log(error);
        res.redirect("/");
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err);
});


app.listen(port, ()=> {
    console.log("Server listening on port: " + port);
});
