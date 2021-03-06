import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
import LocalizedStrings from 'react-localization';
import Autocomplete from 'react-autocomplete';
import {ru, kk} from '../languages/header.json';
import Loader from 'react-loader-spinner';
import NavBar from './Navbar.js';
//import $ from 'jquery';
import { Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
let e = new LocalizedStrings({ru,kk});

var navBtnStyle = {
  backgroundColor: 'rgb(0, 50, 125)',
  border: 'none',
  cursor: 'pointer'
};

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    (localStorage.getItem('lang')) ? e.setLanguage(localStorage.getItem('lang')) : e.setLanguage('ru');

    this.state = {
      rolename: "",
      showBottomNavbar: false,
      loaderHidden: true,
      searchText: ""
    };

    this.checkToken = this.checkToken.bind(this);
    this.logout = this.logout.bind(this);
    this.toggleBottomNavbar = this.toggleBottomNavbar.bind(this);
    this.handler = this.handler.bind(this);
    this.search = this.search.bind(this);
    // this.loaderHidden = this.loaderHidden.bind(this);
  }

  logout() {
    this.setState({ loaderHidden: false });
    var token = sessionStorage.getItem('tokenInfo');
    //console.log(token);
    if (token)
    {
      var xhr = new XMLHttpRequest();
      xhr.open("post", window.url + "api/logout", true);
      //Send the proper header information along with the request
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

      xhr.onload = function () {
        if (xhr.status === 200) {
          sessionStorage.clear();
          this.props.history.replace('/');
          console.log("loggedOut");
        }
        else if(xhr.status === 401){
          sessionStorage.clear();
          this.props.history.replace("/");
        }

        this.setState({ loaderHidden: true });
      }.bind(this);
      xhr.send();
    }
  }

  search(e) {
    e.preventDefault();

    var query = document.getElementById('search_field');
    this.props.history.push('/search/' + query.value);
  }

  updateLanguage(name){
    localStorage.setItem('lang', name);
    window.location.reload();
    // this.props.history.replace('/');
  }

  checkToken() {
    console.log("checkToken function started");
    var token = sessionStorage.getItem('tokenInfo');
    //var name = sessionStorage.getItem('userName');
    //var logstatus = sessionStorage.getItem('logStatus');
    if(token){
      var xhr = new XMLHttpRequest();
      xhr.open("get", window.url + "api/user_info", true);
      //Send the proper header information along with the request
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.onload = function(e) {
        if (xhr.status === 200) {
          console.log("valid token");
          // this.updateLogStatus(logstatus);
          // this.updateUsername(name);
        }else {
          console.log("invalid token");
          sessionStorage.clear();
          this.props.history.replace('/');
          //alert("Your token is invalid please refresh the page.");
        }
      }.bind(this);
      xhr.send();
    }
  }

  toggleBottomNavbar() {
    this.setState({showBottomNavbar: !this.state.showBottomNavbar});
  }

  componentWillMount() {
    //console.log("Header will mount");
    this.checkToken();
  }

  componentDidMount() {
    //console.log("Header did mount");
  }

  handler () {
    if(this.state.loaderHidden){
        this.setState({
        loaderHidden: false
      })
    }else{
        this.setState({
        loaderHidden: true
      })
    }
  }

  componentWillUnmount() {
    //console.log("Header will unmount");
  }

  render() {
    //console.log("rendering the Header");
    var rolename = "";
    if(sessionStorage.getItem('tokenInfo')){
      rolename = JSON.parse(sessionStorage.getItem('userRoles'))[0];
      if(JSON.parse(sessionStorage.getItem('userRoles'))[1]){
        rolename = JSON.parse(sessionStorage.getItem('userRoles'))[1];
      }
      else{
        rolename = JSON.parse(sessionStorage.getItem('userRoles'))[0];
      }
    }

    var fullLoc = window.location.href.split('/');
    var style, panelTrue;
    if ( fullLoc[4] === 'panel')
    {
      style = {
        background: '#353535'
      };
      panelTrue = true;
      return (
        <div style={{height: '60px',position: 'relative',background:'#222222'}}>
          {!this.state.loaderHidden &&
          <div className="bigLoaderDiv">
            <div className="loaderDiv" style={{textAlign: 'center'}}>
              <Loader type="Oval" color="#46B3F2" height="200" width="200"/>
            </div>
          </div>
          }
          <div className="container-fluid p-0" style={{background: '#222222'}}>
            {this.state.loaderHidden &&
            <NavBar pathName={this.props.location.pathname} logout={this.logout.bind(this)} bgstyle={style} panelTrue={panelTrue} />
            } 
          </div>
        </div>
      );
    }else {
      style = {
        background: '#F8F9FA'
      };
      panelTrue = false;
      return (
        <div>
          {!this.state.loaderHidden &&
          <div className="bigLoaderDiv">
            <div className="loaderDiv" style={{textAlign: 'center'}}>
              <Loader type="Oval" color="#46B3F2" height="200" width="200"/>
            </div>
          </div>
          }
          <div className="header" data-url={this.props.location.pathname}>
            <div className="header_top">
              <div className="container">
                <div className="row">
                  <div className="search col-md-7 text-left pl-0">
                    <form onSubmit={this.search}>
                      <div className="form-group ">
                        <Autocomplete
                          getItemValue={(item) => item.label}
                          shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                          items={[
                            {key: 0, label: 'Выдача АПЗ'},
                          ]}
                          renderItem={(item, isHighlighted) =>
                            <div key={item.key} style={{
                              fontWeight: 'bold',
                              backgroundColor: '#fff',
                              color: '#1a4482',
                              padding: '2px 10px',
                              borderRadius: '0',
                              cursor: 'pointer'
                            }}>
                              {item.label}
                            </div>
                          }
                          open={this.state.searchText.length > 2}
                          value={this.state.searchText}
                          onChange={(e) => this.setState({searchText: e.target.value})}
                          onSelect={(val) => this.props.history.push('/search/' + val)}
                          wrapperStyle={{display: 'block'}}
                          menuStyle={{
                            borderRadius: '0px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '0',
                            fontSize: '90%',
                            position: 'fixed',
                            overflow: 'auto',
                            maxHeight: '50%'
                          }}
                          inputProps={{
                            className: "col-md-4 mainSearch",
                            id: "search_field",
                            placeholder: e.searchbysite
                          }}
                        />
                        <span className=" text-white">
                          {e.justlike}:
                          <Link className="underline text-white" to={"/search/" + e.issuanceof}>
                            {e.issuanceof}
                          </Link>
                        </span>
                      </div>
                    </form>
                  </div>
                  <div className="col-md-5 ml-0 regist pr-0">
                    <div className="lang pull-right">
                      {localStorage.getItem('lang') === 'kk' ?
                        (<span>Қаз</span>) :
                        (<a style={{cursor: 'pointer', color: '#ffc107'}}
                            onClick={this.updateLanguage.bind(this, 'kk')}>Қаз</a>)
                      } &nbsp;
                      {localStorage.getItem('lang') === 'ru' ?
                        (<span>Рус</span>) :
                        (<a style={{cursor: 'pointer', color: '#ffc107'}}
                            onClick={this.updateLanguage.bind(this, 'ru')}>Рус</a>)
                      }
                    </div>

                    <div className="login_buttons pull-right clear">
                      {/*<a className="float-left nav-link" href="#">
                      <button className="btn btn-outline-light  my-2 my-sm-0" type="submit"><span>ВХОД</span></button>
                      <Button color="primary" on>ВХОД</Button>
                    </a>*/}
                      <NavLink to={"/panel/"} className="btn btn-danger bg-danger text-white font-weight-bold" replace>Электронная архитектура</NavLink>
                      {/*<a className="nav-link" href="#">
                      <button className="btn btn-outline-light my-2 my-sm-0" type="submit"><span>РЕГИСТРАЦИЯ</span></button>
                    </a>*/}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="container header_bottom">
              <div className="text-center site-logo">
                <img className="image-fluid" width="90" src="./images/logo.png"
                     alt="Управление Архитектуры и Градостроительства города Алматы"/>
                <h4 className="text-white font-weight-bold ">{e.title}</h4>
              </div>
            </div>
            <div className="container nav-bar p-0" style={{background: '#F8F9FA'}}>
              {this.state.loaderHidden &&
              <NavBar pathName={this.props.location.pathname} logout={false} bgstyle={style} panelTrue={panelTrue} />
              }
            </div>
          </div>
        </div>
      )
    }
  }
}

class LoginBtn extends React.Component {

  render() {
    return(
      <div className="row" style={{paddingTop: '0'}}>
        <NavLink to={"/login"} className="btn btn-white LoginBtn" replace>{e.login}</NavLink>&nbsp;
        <NavLink to={"/register"} className="btn btn-white LoginBtn" replace>{e.register}</NavLink>
      </div>
    )
  }
}

class LogoutBtn extends Component {
  constructor() {
    super();
    this.onLogout = this.onLogout.bind(this);
  }

  onLogout() {
    this.props.logout();
  }


  render() {
    return(
      <div>
        <ul>
          <li className="nav-item dropdown personalCabinetDropdown">
            <button className="btn btn-outline-secondary btn-white personalCabinet" href="#" id="cabinetDropdownMenuLink" data-toggle="dropdown">
              <span>{sessionStorage.getItem('userName')} <i className="glyphicon glyphicon-menu-hamburger"></i></span>
            </button>
            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="cabinetDropdownMenuLink">
              {(() => {
                switch(JSON.parse(sessionStorage.getItem('userRoles'))[0]) {
                  case 'Admin': return <AdminMenu />;
                  case 'Reporter': return <ReporterMenu />
                  case 'Urban':
                    if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Head') {
                      return <HeadMenu />
                    }
                    else if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Engineer') {
                      return <EngineerMenu />
                    }
                    else{
                      return <UrbanMenu />;
                    }
                  case 'Provider':
                    if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Electricity') {
                      return <ElectroProviderMenu />;
                    }
                    else if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Gas'){
                      return <GasProviderMenu />;
                    }
                    else if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Heat'){
                      return <HeatProviderMenu />;
                    }
                    else if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Phone'){
                      return <PhoneProviderMenu />;
                    }
                    else{
                      return <WaterProviderMenu />;
                    }
                  case 'Citizen': return <CitizenMenu />;
                  case 'PhotoReport': return <PhotoReportMenu />;
                  case 'Temporary': return <TemporaryMenu />;
                  case 'Apz': return <ApzMenu />;
                  case 'ApzDepartment': return <ApzDepartmentMenu />;
                  default: return null;
                }

              })()}
              <NavLink to={"/editPersonalData"} replace className="dropdown-item" activeClassName="active">Личные данные</NavLink>
              <NavLink to={"/editPassword"} replace className="dropdown-item" activeClassName="active">Изменить пароль</NavLink>
              <button onClick={this.onLogout} className="dropdown-item" style={{cursor: 'pointer'}}>Выйти</button>
            </ul>
          </li>
        </ul>
      </div>
    )
  }
}

class AdminMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/admin"} replace className="dropdown-item" activeClassName="active">Пользователи</NavLink>
        <NavLink to={"/addPages"} replace className="dropdown-item" activeClassName="active">Добавить страницу</NavLink>
        <NavLink to={"/menuEdit"} replace className="dropdown-item" activeClassName="active">Пункты меню</NavLink>
        <NavLink to={"/newsPanel"} replace className="dropdown-item" activeClassName="active">Добавить новость</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
        <NavLink to={"/usersQuestions"} replace className="dropdown-item" activeClassName="active">Вопросы пользователей</NavLink>
      </div>
    )
  }
}

class ReporterMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/newsPanel"} replace className="dropdown-item" activeClassName="active">Добавить новость</NavLink>
      </div>
    )
  }
}

class UrbanMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/urban"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/urbanreport"} replace className="dropdown-item" activeClassName="active">Фильтр</NavLink>
        <NavLink to={"/answertemplate"} replace className="dropdown-item" activeClassName="active">Шаблоны отказов</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
      </div>
    )
  }
}

class ElectroProviderMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/providerelectro"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
      </div>
    )
  }
}

class GasProviderMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/providergas"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
      </div>
    )
  }
}

class HeatProviderMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/providerheat"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
      </div>
    )
  }
}

class WaterProviderMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/providerwater"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
      </div>
    )
  }
}

class PhoneProviderMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/providerphone"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
      </div>
    )
  }
}

class HeadMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/head"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/headreport"} replace className="dropdown-item" activeClassName="active">Фильтр</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Файлы</NavLink>
      </div>
    )
  }
}

class CitizenMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/citizen"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/sketch"} replace className="dropdown-item" activeClassName="active">Заявления на эскизный проект</NavLink>
        <NavLink to={"/photoreports"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
        <NavLink to={"/files"} replace className="dropdown-item" activeClassName="active">Мои файлы</NavLink>
      </div>
    )
  }
}

class PhotoReportMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/photoreportsManage"} replace className="dropdown-item" activeClassName="active">Заявления на фотоотчет</NavLink>
      </div>
    )
  }
}

class TemporaryMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/temporary"} replace className="dropdown-item" activeClassName="active">Личный кабинет</NavLink>
      </div>
    )
  }
}

class EngineerMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/engineer"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
      </div>
    )
  }
}

class ApzMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/apz"} replace className="dropdown-item" activeClassName="active">Личный кабинет</NavLink>
      </div>
    )
  }
}

class ApzDepartmentMenu extends Component {
  render() {
    return (
      <div>
        <NavLink to={"/apz_department"} replace className="dropdown-item" activeClassName="active">Заявления на архитектурно-планировочное задание</NavLink>
        <NavLink to={"/panel/sketch/apz_department"} replace className="dropdown-item" activeClassName="active">Заявления на эскизный проект</NavLink>
      </div>
    )
  }
}