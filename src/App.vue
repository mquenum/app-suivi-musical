<template>
  <div id="app">
    <main>
      <div class="searchbox">
        <div class="action" v-for="(queryTypeOption, i) in queryTypeOptions" v-bind:key="`${i}-${queryTypeOption}`">

          <input type="text"
                 class="searchbar input-elt text"
                 placeholder="Saisissez votre recherche"
                 v-model="query"
                 @keypress="fetchRecord"
                 v-bind:name="queryTypeOption.value">
        </div>
        <ul class="suggest-list" v-if="typeof queryResults !== 'undefined' && !noResults">
          <li class="suggest-item" v-for="(queryResult, i) in queryResults" v-bind:key="`${i}-${queryResult}`" @click="prepareRecordForm(i)">
            <div class="thumb">
              <img v-bind:src="queryResult.thumb" alt="">
            </div>
            <div class="info">
              {{ queryResult.title }}
              <br>
              <div class="info-sub">
                {{ queryResult.year }} - {{ queryResult.country }} - <span v-for="(format, i) in queryResult.format"  v-bind:key="`${i}-${format}`">{{ format }}<span v-if="i !== (queryResult.format.length - 1)"> / </span></span>
              </div>
              <div class="info-sub"><a v-bind:href="`https://discogs.com${queryResult.uri}`" target="_blank">Lien Discogs</a></div>
            </div>
          </li>
        </ul>
        <div class="suggest-list" v-if="noResults">
          <div class="suggest-item">
            <div class="info" @click="manuallyFillForm(true)">
              Aucun résultat. Cliquez pour entrer le disque manuellement.
            </div>
          </div>
        </div>
      </div>
      <div class="records-wrapper">
        <ul class="record-list">
          <li class="record-item submit-record-wrapper" v-if="Object.keys(this.record).length > 0 || manuallyFormTriggered">
            <form id="submit-record" class="submit-record-form">
              <div class="cover">
                <img v-bind:src="this.record.cover_image" alt="cover">
              </div>
              <div class="form-content">
                <div class="input-wrapper">
                  <label for="record-artists" class="label">Artiste(s)</label>
                  <input type="text" id="record-artists" class="input-elt text" ref="record-artists" v-model="this.record.artists">
                </div>
                <div class="input-wrapper">
                  <label for="record-title" class="label">Titre</label>
                  <input type="text" id="record-title" class="input-elt text" ref="record-title" v-model="this.record.onlytitle">
                </div>

                <div class="input-wrapper">
                  <label for="record-country" class="label">Pays</label>
                  <input type="text" id="record-country" class="input-elt text" ref="record-country" v-model="this.record.country">
                </div>

                <div class="input-wrapper">
                  <label for="record-label" class="label">Label</label>
                  <input type="text" id="record-label" class="input-elt text" ref="record-label" v-model="this.record.label">
                </div>

                <div class="input-wrapper">
                  <label for="record-catno" class="label">Cat.</label>
                  <input type="text" id="record-catno" class="input-elt text" ref="record-catno" v-model="this.record.catno">
                </div>

                <div class="input-wrapper">
                  <label for="record-released" class="label">Sortie</label>
                  <input type="text" id="record-released" class="input-elt text" ref="record-released" v-model="this.record.year">
                </div>

                <div class="input-wrapper">
                  <label for="record-format" class="label">Format</label>
                  <input type="text" id="record-format" class="input-elt text" ref="record-format" v-model="this.record.format">
                </div>

                <div class="input-wrapper">
                  <label for="record-genre" class="label">Genre</label>
                  <input type="text" id="record-genre" class="input-elt text" ref="record-genre" v-model="this.record.genre">
                </div>

                <div class="input-wrapper">
                  <label for="record-style" class="label">Style</label>
                  <input type="text" id="record-style" class="input-elt text" ref="record-style" v-model="this.record.style">
                </div>

                <div class="input-wrapper">
                  <label for="record-url" class="label">Lien</label>
                  <input type="text" id="record-url" class="input-elt text" ref="record-url" v-model="this.recordUrl">
                </div>

                <div class="input-wrapper">
                  <label for="record-description" class="label">Description</label>
                  <textarea class="input-elt" id="record-description" ref="record-description" v-model="this.recordDescription"></textarea>
                </div>

                <div class="input-wrapper">
                  <label for="record-highlights" class="label">Notable</label>
                  <select id="record-highlights" class="input-elt" ref="record-highlights" multiple>
                    <option v-for="(track, i) in this.record.tracklist" v-bind:key="`${i}-${track}`" v-bind:value="`${track}`">
                      {{ track.position }} - {{ track.title }}
                    </option>
                  </select>
                </div>

                <div class="input-wrapper">
                  <div>Status</div>
                  <label for="record-status-dled" class="label-check">Telechargé ?</label>
                  <input type="checkbox" id="record-status-dled" ref="record-status-dled" v-model="this.recordStatus" name="record-status[]">
                  <label for="record-status-bought" class="label-check">Acheté ?</label>
                  <input type="checkbox" id="record-status-bought" ref="record-status-bought" v-model="this.recordStatus" name="record-status[]">
                </div>

                <div class="input-wrapper">
                  <label for="record-favorite" class="label-check">Favori ?</label>
                  <input type="checkbox" id="record-favorite" ref="record-favorite" v-model="this.recordIsFavorite" name="record-favorite">
                </div>

                <div class="input-wrapper">
                  <button @click.prevent="newRecordSubmission">Enregistrer</button>
                </div>
              </div>
            </form>
          </li>
          <li class="record-item" v-for="(listenedRecord, i) in listenedRecords" v-bind:key="`${i}-${listenedRecord}`">
            <div class="cover">
              <img v-bind:src="listenedRecord.recordCover" alt="" class="cover">
            </div>
            <ul class="details">
              <li class="release-type">{{ listenedRecord.releaseTypeKey }}</li>
              <li class="release-date">{{ listenedRecord.releaseDate }}</li>
              <li class="country">{{ listenedRecord.country }}</li>
              <li class="artist">
                <div v-for="(artist, i) in listenedRecord.artist" v-bind:key="`${i}-${artist}`">
                  <span>{{ artist.name }}</span>
                  <span v-if="artist.sortName !== ''">{{ artist.sortName }}</span>
                </div>
              </li>
              <li class="release">{{ listenedRecord.release }}</li>
              <li class="labelInfo">
                <div v-for="(label, i) in listenedRecord.labelInfo" v-bind:key="`${i}-${label}`">
                  {{ label.label }} - {{ label.catalogNumber }}
                </div>
              </li>
              <li class="genre">
                <div v-for="(genre, i) in listenedRecord.genre" v-bind:key="`${i}-${genre}`">
                  {{ genre }}
                </div>
              </li>
            </ul>
            <div class="description">{{ listenedRecord.description }}</div>
            <ul class="highlights" v-for="(highlight, i) in listenedRecord.highlights.trackname" v-bind:key="`${i}-${highlight}`">
              <li class="track-name">{{ highlight }}</li>
            </ul>
            <div v-if="listenedRecord.link !== ''" class="link">
              <a href="#">{{ listenedRecord.link }}</a>
            </div>
            <div class="is-favorite">
              <span v-if="listenedRecord.isFavorite === 'true'">Favorite !</span>
            </div>
            <ul class="status" v-for="(status, i) in listenedRecord.status" v-bind:key="`${i}-${status}`">
              <li class="dl" v-if="status.isDl === 'true'">Téléchargé</li>
              <li class="bought" v-if="status.isBought === 'true'">Acheté</li>
              <li class="bought" v-if="status.isBought === 'false' && status.isDl === 'false'">Non obtenu</li>
            </ul>
            <div class="publication-date">{{ listenedRecord.createdAt }}</div>
            <ul v-if="listenedRecord.updatedAt !== listenedRecord.createdAt" class="publication-date">
              <li>
                <span>{{ listenedRecord.updatedAt }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      database_url: 'http://localhost:8081/api/',
      records_url: 'http://localhost:8081/api/records',
      api_root_url: 'https://api.discogs.com/',
      query: '',
      queryTypeSelected: 'release',
      queryTypeOptions: [
        { text: 'Releases', value: 'release' }
      ],
      record: {},
      queryResults: {},
      listenedRecords: {},
      recordTracklist: {},
      noResults: false,
      manuallyFormTriggered: false,
      formData: [],
      recordDescription: '',
      recordUrl: '',
      recordStatus: [],
      recordIsFavorite: false
    }
  },
  created() {
    fetch(`${this.records_url}`)
    .then(response => response.json())
    .then(data => (this.listenedRecords = data));
  },
  methods: {
    fetchRecord (e) {
      /*let headers = new Headers({
        "Accept"       : "application/json",
        "Content-Type" : "application/json",
        "User-Agent"   : "AppSuiviMusical/1.0.1 (mikayil.quenum.sanfo@protonmail.com)"
      });
      let init = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
      };*/

      if (e.key === "Enter"){
        this.db.search(this.query)
          .then(function(searchResults){
            return searchResults;
          })
          .then(this.setResults);
        /*if (e.key === "Enter"){
          fetch(`${this.api_root_url}${this.queryTypeSelected}?query=${this.query}`, init)
            .then(function(response) {
                return response.json();
            })
            .then(this.setResults);
        }*/
      }
    },
    setResults (results) {
      if (results.pagination.items > 0){
        this.noResults = false;
        this.manuallyFillForm(false);
        this.queryResults = results.results;
        console.log(this.queryResults);
      } else {
        this.noResults = true;
      }
    },
    prepareRecordForm(index){
      this.record = this.queryResults[index];
      let self = this;

      switch(this.record.type){
        case "master":
          this.db.getMaster(this.record.id)
            .then(function(release){
              self.prepareSelectedData(release)
            });
          break;
        case "release":
          this.db.getRelease(this.record.id)
            .then(function(release){
              self.prepareSelectedData(release)
            });
          break;
      }

      this.queryResults = undefined;
    },
    prepareSelectedData: function(release){
      var artistsArray = [];

      release.artists.forEach((item) => {
        artistsArray.push(item.name);
      });

      this.$set(this.record, 'tracklist', release.tracklist);
      this.$set(this.record, 'artists', artistsArray);
      this.$set(this.record, 'onlytitle', release.title);
      this.$set(this.record, 'url', '');
      this.$set(this.record, 'description', '');
    },
    manuallyFillForm: function(status){
      this.manuallyFormTriggered = status;
      this.record = '';
      this.noResults = false;
    },
    newRecordSubmission: function () {
      const fs = require('fs');

      this.axios.get({
        url: this.record.cover_image,
        responseType: 'stream'
      }).then((response) => response.data.pipe(fs.createWriteStream(`'${this.record.id}.jpeg'`)));

      /*this.axios.post(this.database_url, {
        cover_image: this.record['cover_image'],
        artists: this.$refs['artists'],
        onlytitle: this.$refs['onlytitle'],
        country: this.$refs['country'],
        label: this.$refs['label'],
        catno: this.$refs['catno'],
        year: this.$refs['year'],
        format: this.$refs['format'],
        genre: this.$refs['genre'],
        style: this.$refs['style'],
        url: this.$refs['url'],
        description: this.$refs['description'],
        highlights: {
          trackname: this.$refs[ref]
        },
        isFavorite: this.$refs['isFavorite'],
        status: this.$refs['status']
      }).then((response) => {
        console.log(response.data)
      })*/
      console.log(this.$refs);
      for (var ref in this.$refs) {
        console.log(this.$refs[ref].id, this.$refs[ref].value);
      }
    }
  }
}
</script>

<style lang="scss">
  @mixin rem($property, $values) {
    $px: ();
    $rem: ();

    @each $value in $values {
      @if $value==0 or $value==auto {
        $px: append($px, $value);
        $rem: append($rem, $value);
      }

      @else {
        $unit: unit($value);
        $val: parseint($value);
        $basefont: 16;

        @if $unit=="px" {
          $px: append($px, $value);
          $rem: append($rem, ($val / $basefont + rem));
        }

        @if $unit=="rem" {
          $px: append($px, ($val * $basefont + px));
          $rem: append($rem, $value);
        }
      }
    }

    @if $px==$rem {
      #{$property}: $px;
    }

    @else {
      #{$property}: $px;
      #{$property}: $rem;
    }
  }

  *{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, "sans-serif";
  }

  ul{
    list-style: none;
  }

  #app{
    transition: 0.3s;
  }

  main{
    min-height: 100vh;
    /*@include rem(padding,25px);*/
    padding: 25px;
    background-image: linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.25));
  }

  .suggest{
    &-list{
      position: absolute;
      top: 100%;
      left:0;
      width: 100%;
      border-radius: 0 0 5px 5px;
      border:1px solid #eeeeee;
      border-top:none;
      max-height: 500px;
      overflow-y: scroll;
    }
    &-item{
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      padding: 10px;
      cursor: pointer;
      background-color: #ffffff;
      transition: 0.25s;
      &:hover{
        background-color: cornflowerblue;
        color:#ffffff;
      }
      .thumb{
        margin-right: 10px;
        width: 75px;
        flex-shrink: 0;
        img{
          width: 100%;
          height: auto;
        }
      }
      .info{
        font-size:14px;
        &-sub{
          color:#a0a0a0;
          font-size:12px;
        }
      }
    }
  }

  .searchbox{
    position: relative;
    margin-bottom: 20px;
    .action{
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .input-elt{
    width:100%;
    padding: 10px;
    border-radius: 5px;
    border:1px solid #eeeeee;
    background-color: rgba(255,255,255,0.5);
    transition: 0.3s;
    &:focus{
      box-shadow: 0 0 5px rgba(0,0,0,0.25);
      outline: none;
    }
    &.text{
      height: 45px;
    }
  }

  .record-item{
    .cover{
      width: 100%;
      height: auto;
    }
  }

  .cover{
    margin-bottom: 15px;
    img{
      width: 100%;
      height:auto;
      border-radius: 5px;
    }
  }

  .submit-record{
    &-form{
      .input-wrapper {
        margin-bottom: 15px;
        .label{
          background: rgba(255, 255, 255, 0.5);
          display: block;
          padding: 10px 10px 5px 10px;
          border-radius: 5px 5px 0 0;
          border: 1px solid #eeeeee;
          border-bottom: none;
          font-size: 12px;
          font-weight: 700;
        }
        .input-elt{
          padding-top:5px;
          border-top: none;
          border-radius:0 0 5px 5px;
          border-bottom-color:#a0a0a0;
        }
      }
    }
  }

  .record{
    &-list{
      display: flex;
      flex-direction: column;
      @media screen and (min-width:768px){
        flex-direction: row;
        justify-content: flex-start;
      }
    }
    &-item{
      margin-bottom:20px;
      @media screen and (min-width:768px){
        width:50%;
        margin:0 15px;
      }
      @media screen and (min-width:1024px){
        width:calc((100% / 3) - 30px);
      }
      .cover{

      }
    }
  }
</style>
