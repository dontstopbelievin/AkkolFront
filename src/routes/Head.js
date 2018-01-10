import React from 'react';
import * as esriLoader from 'esri-loader';
//import { NavLink } from 'react-router-dom';

export default class Head extends React.Component {
  constructor() {
    super();

    this.state = {
      acceptedForms: [],
      declinedForms: [],
      onHoldForms: [],
      showDetails: false,
      showButtons: true,
      Id: "",
      Applicant: "",
      Address: "",
      Phone: "",
      Customer: "",
      Designer: "",
      ProjectName: "",
      ProjectAddress: "",
      ApzDate: "",
      connectionPoint: "",
      gasPipeDiameter: 0,
      assumedCapacity: 0,
      reconsideration: "",
      docNumber: "",
      description: "",
      file: [],
      waterDoc: null,
      waterDocExt: null,
      waterResponse: null,
      electroDoc: null,
      electroDocExt: null,
      electroResponse: null,
      heatDoc: null,
      heatDocExt: null,
      heatResponse: null,
      gasDoc: null,
      gasDocExt: null,
      gasResponse: null,
      response: null,
      personalIdDoc: null,
      personalIdDocExt: null,
      confirmedTaskDoc: null,
      confirmedTaskDocExt: null,
      titleDocumentDoc: null,
      titleDocumentDocExt: null,
      showGasDetail: false,
      showWaterDetail: false,
      showElectroDetail: false,
      showHeatDetail: false
    }

    this.getApzFormList = this.getApzFormList.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.toggleGasDetail = this.toggleGasDetail.bind(this);
    this.toggleWaterDetail = this.toggleWaterDetail.bind(this);
    this.toggleElectroDetail = this.toggleElectroDetail.bind(this);
    this.toggleHeatDetail = this.toggleHeatDetail.bind(this);
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  onFileChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  toggleGasDetail() {
    this.setState({
      showGasDetail: !this.state.showGasDetail
    })
  }

  toggleWaterDetail() {
    this.setState({
      showWaterDetail: !this.state.showWaterDetail
    })
  }

  toggleElectroDetail() {
    this.setState({
      showElectroDetail: !this.state.showElectroDetail
    })
  }

  toggleHeatDetail() {
    this.setState({
      showHeatDetail: !this.state.showHeatDetail
    })
  }

  // get the list of apz forms
  getApzFormList() {
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/apz/all", true);
    //Send the proper header information along with the request
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function () {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        //console.log(data);
        // filter the whole list to get only accepted apzForms
        var acc_forms_list = data.filter(function(obj) { return (obj.Status === 1 && (obj.HeadDate !== null && obj.HeadResponse === null)); });
        this.setState({acceptedForms: acc_forms_list});
        // filter the list to get the declined apzForms
        var dec_forms_list = data.filter(function(obj) { return (obj.Status === 0 && (obj.HeadDate !== null && obj.HeadResponse !== null)); });
        this.setState({declinedForms: dec_forms_list});
        // filter the list to get the unanswered apzForms
        var onhold_forms_list = data.filter(function(obj) { return obj.Status === 4; });
        this.setState({onHoldForms: onhold_forms_list});
      }
    }.bind(this);
    xhr.send();
  }

  // get detailed info for clicked apz
  getApzDetails(apzId) {
    var token = sessionStorage.getItem('tokenInfo');

    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/apz/head/detail/" + apzId, true);
    //Send the proper header information along with the request
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.send();
    xhr.onload = function () {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        console.log(data);
        this.setState({ showButtons: false });
        if(data.Status === 4) { this.setState({ showButtons: true }); }
        this.setState({ showDetails: true });
        this.setState({ Id: data.Id });
        this.setState({ Applicant: data.Applicant });
        this.setState({ Address: data.Address });
        this.setState({ Phone: data.Phone });
        this.setState({ Customer: data.Customer });
        this.setState({ Designer: data.Designer });
        this.setState({ ProjectName: data.ProjectName });
        this.setState({ ProjectAddress: data.ProjectAddress });
        this.setState({ waterDoc: data.WaterDoc });
        this.setState({ waterDocExt: data.WaterDocExt });
        this.setState({ waterResponse: data.WaterResponse });
        this.setState({ electroDoc: data.ElectroDoc });
        this.setState({ electroDocExt: data.ElectroDocExt });
        this.setState({ electroResponse: data.ElectroResponse });
        this.setState({ heatDoc: data.HeatDoc });
        this.setState({ heatDocExt: data.HeatDocExt });
        this.setState({ heatResponse: data.HeatResponse });
        this.setState({ gasDoc: data.GasDoc });
        this.setState({ gasDocExt: data.GasDocExt });
        this.setState({ gasResponse: data.GasResponse });
        this.setState({ personalIdDoc: data.PersonalIdFile });
        this.setState({ personalIdDocExt: data.PersonalIdFileExt });
        this.setState({ confirmedTaskDoc: data.ConfirmedTaskFile });
        this.setState({ confirmedTaskDocExtir: data.ConfirmedTaskFileExt });
        this.setState({ titleDocumentDoc: data.TitleDocumentFile });
        this.setState({ titleDocumentDocExt: data.TitleDocumentFileExt });
        this.setState({ connectionPoint: data.ConnectionPoint });
        this.setState({ gasPipeDiameter: data.GasPipeDiameter });
        this.setState({ assumedCapacity: data.AssumedCapacity });
        this.setState({ reconsideration: data.Reconsideration });
        this.setState({ docNumber: data.DocNumber });
        this.setState(function(){
          var jDate = new Date(data.ApzDate);
          var curr_date = jDate.getDate();
          var curr_month = jDate.getMonth() + 1;
          var curr_year = jDate.getFullYear();
          var formated_date = curr_date + "-" + curr_month + "-" + curr_year;
          return { ApzDate: formated_date }
        });

        if ([data.WaterResponse, data.ElectroResponse, data.HeatResponse, data.GasResponse].indexOf(false) === -1) {
          this.setState({ response: true });
        }
      }
    }.bind(this);
  }

  // function to print apzForm in .pdf format
  printApz(apzId, project) {
    //console.log(apzId);
    var token = sessionStorage.getItem('tokenInfo');
    if (token) {
      var xhr = new XMLHttpRequest();
      xhr.open("get", window.url + "api/apz/print/" + apzId, true);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.onload = function () {
        console.log(xhr);
        console.log(xhr.status);
        if (xhr.status === 200) {
          //test of IE
          if (typeof window.navigator.msSaveBlob === "function") {
            window.navigator.msSaveBlob(xhr.response, "apz-" + new Date().getTime() + ".pdf");
          } 
          else {
            var blob = xhr.response;
            var link = document.createElement('a');
            var today = new Date();
            var curr_date = today.getDate();
            var curr_month = today.getMonth() + 1;
            var curr_year = today.getFullYear();
            var formated_date = "(" + curr_date + "-" + curr_month + "-" + curr_year + ")";
            //console.log(curr_day);
            link.href = window.URL.createObjectURL(blob);
            link.download = "апз-" + project + formated_date + ".pdf";

            //append the link to the document body
            document.body.appendChild(link);
            link.click();
          }
        }
      }
      xhr.send();
    } else {
      console.log('session expired');
    }
  }

  // accept or decline the form
  acceptDeclineApzForm(apzId, status, comment) {
    //console.log(apzId);
    //console.log(statusName);
    var token = sessionStorage.getItem('tokenInfo');
    var file = this.state.file;

    var formData = new FormData();
    formData.append('file', file);
    formData.append('Response', status);
    formData.append('Message', comment);

    var tempAccForms = this.state.acceptedForms;
    var tempDecForms = this.state.declinedForms;
    var tempOnHoldList = this.state.onHoldForms;
    // need to get the position of form in the list
    var formPos = tempOnHoldList.map(function(x) {return x.Id; }).indexOf(apzId);
    //console.log(formPos);

    var xhr = new XMLHttpRequest();
    xhr.open("post", window.url + "api/apz/status/" + apzId, true);
    //Send the proper header information along with the request
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.onload = function () {
      var data = JSON.parse(xhr.responseText);
      console.log(data);
      if (xhr.status === 200) {
        if(status === true){
          alert("Заявление принято!");
          // to hide the buttons
          this.setState({ showButtons: false });
          tempOnHoldList.splice(formPos,1);
          this.setState({onHoldForms: tempOnHoldList});
          tempAccForms.push(data);
          this.setState({acceptedForms: tempAccForms});
          console.log("Заявление принято!");
        }
        else{
          alert("Заявление отклонено!");
          // to hide the buttons
          this.setState({ showButtons: false });
          tempOnHoldList.splice(formPos,1);
          this.setState({onHoldForms: tempOnHoldList});
          tempDecForms.push(data);
          this.setState({declinedForms: tempDecForms});
          console.log("Заявление отклонено!");
        }
      }
      else if(xhr.status === 401){
        sessionStorage.clear();
        alert("Token is expired, please login again!");
        this.props.history.replace("/login");
      }
    }.bind(this);
    xhr.send(formData); 
  }

  // function to download files
  downloadFile(event) {
    var buffer =  event.target.getAttribute("data-file")
    var name =  event.target.getAttribute("data-name");
    var ext =  event.target.getAttribute("data-ext");

    var base64ToArrayBuffer = (function () {
      
      return function (base64) {
        var binaryString =  window.atob(base64);
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        
        for (var i = 0; i < binaryLen; i++)        {
            var ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        
        return bytes; 
      }
      
    }());

    var saveByteArray = (function () {
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      
      return function (data, name) {
          var blob = new Blob(data, {type: "octet/stream"}),
              url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = name;
          a.click();
          window.URL.revokeObjectURL(url);
      };

    }());

    saveByteArray([base64ToArrayBuffer(buffer)], name + ext);
  }

  createMap(element){
    if(sessionStorage.getItem('tokenInfo')){ 
      console.log(this.refs);

      esriLoader.dojoRequire([
      "esri/views/MapView",
      "esri/widgets/LayerList",
      "esri/WebScene",
      "esri/layers/FeatureLayer",
      "esri/layers/TileLayer",
      "esri/widgets/Search",
      "esri/Map",
      "dojo/domReady!"
    ], function(
        MapView, LayerList, WebScene, FeatureLayer, TileLayer, Search, Map
      ) {
        var map = new Map({
          basemap: "topo"
        });
        
        var flRedLines = new FeatureLayer({
          url: "https://gis.uaig.kz/server/rest/services/Hosted/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D1%8B%D0%B5_%D0%BB%D0%B8%D0%BD%D0%B8%D0%B8/FeatureServer",
          outFields: ["*"],
          title: "Красные линии"
        });
        map.add(flRedLines);

        var flFunZones = new FeatureLayer({
          url: "https://gis.uaig.kz/server/rest/services/Hosted/%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5_%D0%B7%D0%BE%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B52/FeatureServer",
          outFields: ["*"],
          title: "Функциональное зонирование"
        });
        map.add(flFunZones);
      
        var flGosAkts = new FeatureLayer({
          url: "https://gis.uaig.kz/server/rest/services/Hosted/%D0%97%D0%B0%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5_%D0%B3%D0%BE%D1%81%D1%83%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D0%B5_%D0%B0%D0%BA%D1%82%D1%8B/FeatureServer",
          outFields: ["*"],
          title: "Гос акты"
        });
        map.add(flGosAkts);

        var view = new MapView({
          container: element,
          map: map,
          center: [76.886, 43.250], // lon, lat
          scale: 10000
        });
        
        var searchWidget = new Search({
          view: view,
          sources: [{
            featureLayer: new FeatureLayer({
              url: "https://gis.uaig.kz/server/rest/services/Hosted/%D0%97%D0%B0%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5_%D0%B3%D0%BE%D1%81%D1%83%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D0%B5_%D0%B0%D0%BA%D1%82%D1%8B/FeatureServer",
              popupTemplate: { // autocasts as new PopupTemplate()
                title: "Кадастровый номер: {cadastral_number} </br> Назначение: {function} <br/> Вид собственности: {ownership}"
              }
            }),
            searchFields: ["cadastral_number"],
            displayField: "cadastral_number",
            exactMatch: false,
            outFields: ["cadastral_number", "function", "ownership"],
            name: "Зарегистрированные государственные акты",
            placeholder: "Кадастровый поиск"
          }]
        });
        // Add the search widget to the top left corner of the view
        view.ui.add(searchWidget, {
          position: "top-right"
        });
        
        view.then(function() {
          var layerList = new LayerList({
            view: view
          });

          // Add widget to the bottom right corner of the view
          view.ui.add(layerList, "bottom-right");
        });     
      });
    }
  }

  onReference(element) {
    if(sessionStorage.getItem('tokenInfo')){
      console.log('mounted');
      if(!esriLoader.isLoaded()) {
        esriLoader.bootstrap(
          err => {
            if(err) {
              console.log(err);
            } else {
              this.createMap(element);
            }
          },
          {
            url: "https://js.arcgis.com/4.5/"
          }
        );
      } else {
        this.createMap(element);
      }
    }
  }

  componentWillMount() {
    //console.log("HeadComponent will mount");
    if(sessionStorage.getItem('tokenInfo')){
      var userRole = JSON.parse(sessionStorage.getItem('userRoles'))[1];
      this.props.history.replace('/' + userRole);
    }else {
      this.props.history.replace('/');
    }
  }

  componentDidMount() {
    //console.log("HeadComponent did mount");
    this.getApzFormList();
  }

  componentWillUnmount() {
    //console.log("HeadComponent will unmount");
  }

  render() {
    //console.log("rendering the HeadComponent");
    var acceptedForms = this.state.acceptedForms;
    var declinedForms = this.state.declinedForms;
    var onHoldForms = this.state.onHoldForms;
    return (
      <div>
        {/*<nav className="navbar-expand-lg navbar-light bg-secondary">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="container collapse navbar-collapse" id="navbarTogglerDemo03">
           <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
             <li className="nav-item">
               <NavLink to={"/Urban"} replace className="nav-link" activeClassName="active">Гос. услуги 1</NavLink>
             </li>
             <li className="nav-item">
               <NavLink to={"/Urban"} replace className="nav-link" activeClassName="active">Гос. услуги 2</NavLink>
             </li>
             <li className="nav-item">
               <NavLink to={"/Urban"} replace className="nav-link" activeClassName="active">Гос. услуги 3</NavLink>
             </li>
            </ul>
          </div>
        </nav>*/}
        <div className="content container">
          <div className="row">
            <style dangerouslySetInnerHTML={{__html: ``}} />
              <div className="col-md-3">
                <h4 style={{textAlign: 'center'}}>Список заявлений</h4>
              </div>
              <div className="col-md-6">
                <h4 style={{textAlign: 'center'}}>Карта</h4>
              </div>
              <div className="col-md-3">
                <h4 style={{textAlign: 'center'}}>Информация</h4>
              </div>
          </div>
          <div className="row">
            <div className="col-md-3 apz-list card">
              <h4><span id="in-process">В процессе</span>
              {
                onHoldForms.map(function(onholdForm, i){
                  return(
                    <li key={i} onClick={this.getApzDetails.bind(this, onholdForm.Id)}>
                      {onholdForm.ProjectName}
                    </li>
                    )
                }.bind(this))
              }
              </h4>
              <h4><span id="accepted">Принятые</span>
              {
                acceptedForms.map(function(accForm, i){
                  return(
                    <li key={i} onClick={this.getApzDetails.bind(this, accForm.Id)}>
                      {accForm.ProjectName}
                    </li>
                    )
                }.bind(this))
              }
              </h4>
              <h4><span id="declined">Отказ</span>
              {
                declinedForms.map(function(decForm, i){
                  return(
                    <li key={i} onClick={this.getApzDetails.bind(this, decForm.Id)}>
                      {decForm.ProjectName}
                    </li>
                  )
                }.bind(this))
              }
              </h4>
            </div>
            <div className="col-md-6 apz-additional card" style={{padding:'0'}}>
              <div className="col-md-12 well" style={{padding:'0', height:'600px', width:'100%'}}>
                  <div className="viewDivHead" ref={this.onReference.bind(this)}>
                    <div className="container">
                      <p>Загрузка...</p>
                    </div>
                  </div>
              </div>
            </div>
            <div id="apz-detailed" className="col-md-3 apz-detailed card" style={{paddingTop: '10px'}}>
              <div className={this.state.showDetails ? 'row' : 'invisible'}>
                <div className="col-6"><b>Заявитель</b>:</div> <div className="col-6">{this.state.Applicant}</div>
                <div className="col-6"><b>Адрес</b>:</div> <div className="col-6">{this.state.Address}</div>
                <div className="col-6"><b>Телефон</b>:</div> <div className="col-6">{this.state.Phone}</div>
                <div className="col-6"><b>Заказчик</b>:</div> <div className="col-6">{this.state.Customer}</div>
                <div className="col-6"><b>Разработчик</b>:</div> <div className="col-6">{this.state.Designer}</div>
                <div className="col-6"><b>Название проекта</b>:</div> <div className="col-6">{this.state.ProjectName}</div>
                <div className="col-6"><b>Адрес проекта</b>:</div> <div className="col-6">{this.state.ProjectAddress}</div>
                <div className="col-6"><b>Дата заявления</b>:</div> <div className="col-6">{this.state.ApzDate}</div>
                { this.state.personalIdDoc ? <div className="col-sm-12"><div className="row"><div className="col-6"><b>Уд. лич./ Реквизиты</b>:</div> <div className="col-6"><a className="text-info pointer" data-file={this.state.personalIdDoc} data-name="Уд. лич./Реквизиты" data-ext={this.state.personalIdDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div></div></div> :''}
                { this.state.confirmedTaskDoc ? <div className="col-sm-12"><div className="row"><div className="col-6"><b>Утвержденное задание</b>:</div> <div className="col-6"><a className="text-info pointer" data-file={this.state.confirmedTaskDoc} data-name="Утвержденное задание" data-ext={this.state.confirmedTaskDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div></div></div> :''}
                { this.state.titleDocumentDoc ? <div className="col-sm-12"><div className="row"><div className="col-6"><b>Правоустанавл. документ</b>:</div> <div className="col-6"><a className="text-info pointer" data-file={this.state.titleDocumentDoc} data-name="Правоустанавл. документ" data-ext={this.state.titleDocumentDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div></div></div> :''}
              
                {/*<button className="btn btn-raised btn-info" 
                      style={{margin: 'auto', marginTop: '20px', marginBottom: '10px'}}
                      onClick={this.printApz.bind(this, this.state.Id, this.state.ProjectName)}>
                  Распечатать АПЗ
                </button>*/}

                { this.state.waterDoc ? 
                  <div className="col-sm-12">
                    { this.state.waterResponse ?
                      <div className="row">
                        <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleWaterDetail}>
                          Посмотреть ТУ Вода
                        </button>
                        {this.state.showWaterDetail && <div className="row detail">
                          <div className="col-6"><b>Файл</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.waterDoc} data-name="ТУ Вода" data-ext={this.state.waterDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                      :
                      <div className="row">
                      <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleWaterDetail}>
                          Посмотреть ТУ Вода
                        </button>
                        {this.state.showWaterDetail && <div className="row detail">
                          <div className="col-6"><b>МО Вода</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.waterDoc} data-name="МО Вода" data-ext={this.state.waterDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                    }
                    
                  </div> :''}
                { this.state.heatDoc ? 
                  <div className="col-sm-12">
                    { this.state.heatResponse ?
                      <div className="row">
                        <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleHeatDetail}>
                          Посмотреть ТУ Тепло
                        </button>
                        {this.state.showHeatDetail && <div className="row detail">
                          <div className="col-6"><b>Файл</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.heatDoc} data-name="ТУ Вода" data-ext={this.state.heatDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                      :
                      <div className="row">
                      <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleHeatDetail}>
                          Посмотреть ТУ Тепло
                        </button>
                        {this.state.showHeatDetail && <div className="row detail">
                          <div className="col-6"><b>МО Тепло</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.heatDoc} data-name="МО Вода" data-ext={this.state.heatDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                    }
                  </div> : ''}
                { this.state.electroDoc ? 
                  <div className="col-sm-12">
                    { this.state.electroResponse ?
                      <div className="row">
                        <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleElectroDetail}>
                          Посмотреть ТУ Электро
                        </button>
                        {this.state.showElectroDetail && <div className="row detail">
                          <div className="col-6"><b>Файл</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.electroDoc} data-name="ТУ Вода" data-ext={this.state.electroDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                      :
                      <div className="row">
                        <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleElectroDetail}>
                          Посмотреть ТУ Электро
                        </button>
                        {this.state.showElectroDetail && <div className="row detail">
                          <div className="col-6"><b>МО Электро</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.electroDoc} data-name="МО Вода" data-ext={this.state.electroDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                    }
                  </div> : ''}
                { this.state.gasDoc ? 
                  <div className="col-sm-12">
                    { this.state.gasResponse ?
                      <div className="row">
                        <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleGasDetail}>
                          Посмотреть ТУ Газ
                        </button>
                        {this.state.showGasDetail && <div className="row detail">
                          <div className="col-6"><b>Точка подключения</b>:</div><div className="col-6">{this.state.connectionPoint}</div>
                          <div className="col-6"><b>Диаметр газопровода (мм)</b>:</div><div className="col-6">{this.state.gasPipeDiameter}</div>
                          <div className="col-6"><b>Предполагаемый объем (м<sup>3</sup>/час)</b>:</div><div className="col-6">{this.state.assumedCapacity}</div>
                          <div className="col-6"><b>Предусмотрение</b>:</div><div className="col-6">{this.state.reconsideration}</div>
                          <div className="col-6"><b>Номер документа</b>:</div><div className="col-6">{this.state.docNumber}</div>
                          <div className="col-6"><b>Файл</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.gasDoc} data-name="ТУ Вода" data-ext={this.state.gasDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                      :
                      <div className="row">
                        <button className="btn btn-raised btn-info" 
                                style={{margin: 'auto', marginTop: '10px', marginBottom: '10px'}}
                                onClick={this.toggleGasDetail}>
                          Посмотреть ТУ Газ
                        </button>
                        {this.state.showGasDetail && <div className="row detail">
                          <div className="col-6"><b>МО Газ</b>:</div> 
                          <div className="col-6"><a className="text-info pointer" data-file={this.state.gasDoc} data-name="МО Вода" data-ext={this.state.gasDocExt} onClick={this.downloadFile.bind(this)}>Скачать</a></div>
                        </div>}
                      </div>
                    }
                  </div> : ''
                }
                
                <div className={this.state.showButtons ? 'col-sm-12 mt-2' : 'invisible'}>
                  <label htmlFor="upload_file">Файл</label>
                  <input type="file" id="upload_file" className="form-control" onChange={this.onFileChange} />
                </div>

                <div className={this.state.showButtons ? 'btn-group' : 'invisible'} role="group" aria-label="acceptOrDecline" style={{margin: 'auto', marginTop: '20px', marginBottom: '10px'}}>
                  { this.state.response ? 
                    <button className="btn btn-raised btn-success" style={{marginRight: '5px'}}
                            onClick={this.acceptDeclineApzForm.bind(this, this.state.Id, true, "your form was accepted")}>
                      Одобрить
                    </button>
                    :
                    <button className="btn btn-raised btn-success" style={{marginRight: '5px'}}
                            onClick={this.acceptDeclineApzForm.bind(this, this.state.Id, true, "your form was accepted")} disabled="disabled">
                      Одобрить
                    </button>
                  }
                  <button className="btn btn-raised btn-danger" data-toggle="modal" data-target="#accDecApzForm">
                    Отклонить
                  </button>
                  <div className="modal fade" id="accDecApzForm" tabIndex="-1" role="dialog" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Причина отклонения</h5>
                          <button type="button" id="uploadFileModalClose" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          <div className="form-group">
                            <textarea rows="5" className="form-control" value={this.state.description} onChange={this.onDescriptionChange} placeholder="Описание"></textarea>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.acceptDeclineApzForm.bind(this, this.state.Id, false, this.state.description)}>Отправить</button>
                          <button type="button" className="btn btn-secondary" data-dismiss="modal">Закрыть</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}