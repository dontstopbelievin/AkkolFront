import React from 'react';
import { NavLink } from 'react-router-dom';
import Slider from 'react-slick';
import LocalizedStrings from 'react-localization';
import {ru, kk} from '../languages/guest.json';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../assets/css/guest.css";
import WOW from 'wowjs';
import Calendar from 'react-calendar';
import { UncontrolledCarousel, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

let e = new LocalizedStrings({ru,kk});

export default class Guest extends React.Component {
  constructor() {
    super();
    (localStorage.getItem('lang')) ? e.setLanguage(localStorage.getItem('lang')) : e.setLanguage('ru');

    this.state = {
      tokenExists: false,
      rolename: "",
      ru: true,
      kk: false,
      date: new Date(),
      first: [],
      second: [],
      third: [],
      forth: [],
      items: [
        {
          src: './images/slideshow/1.jpg',
          altText: '',
          caption: ''
        },
        {
          src: './images/slideshow/2.jpg',
          altText: '',
          caption: ''
        },
        {
          src: './images/slideshow/4.jpg',
          altText: '',
          caption: ''
        }
      ]
    }

    this.getNews = this.getNews.bind(this);
    this.onChange = this.onChange.bind(this);
  }




  gotoLogin() {
    this.props.history.replace('/login');
  }

  componentWillMount() {
    //console.log("GuestComponent will mount");
  }

  componentDidMount() {
    //console.log("GuestComponent did mount");
    new WOW.WOW({
        live: false
    }).init();
    if(sessionStorage.getItem('tokenInfo')){
      this.setState({ tokenExists: true });
      var roleName = JSON.parse(sessionStorage.getItem('userRoles'))[0];
      if(roleName === 'Urban' || roleName === 'Provider'){
        roleName = JSON.parse(sessionStorage.getItem('userRoles'))[1];
        this.setState({ rolename: roleName });
      }
      else{
        this.setState({ rolename: roleName });
      }
    }

    this.getNews();
  }

  componentWillUnmount() {
    //console.log("GuestComponent will unmount");
  }

  // onChange = date => this.setState({ date })

    onChange (date) {
      this.setState({ date });
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var date = '';
        day = String(day);
        month = String(month);
        year = String(year);
      if (day.length == 1){ day = '0' + day;}
      if (month.length == 1){ month = '0' + month;}
        date = year+'-'+month+'-'+day;

      var link = 'api/news/dayNews/'+date;
        var xhr = new XMLHttpRequest();
        xhr.open("get", window.url + link, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        xhr.onload = function() {
          var data = JSON.parse(xhr.responseText);
          if (data.news.length != 0) {
            this.props.history.replace('/dayNews/'+date);
          } else {
            alert("Нет новостей на этот день!");
          }
        }.bind(this);
        xhr.send();


    }

  getNews () {
        var link = 'api/news/lastFresh'
        var xhr = new XMLHttpRequest();
        xhr.open("get", window.url + link, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        xhr.onload = function() {
          if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log(data.news);
            var x = data.news.length;

            for (var i = 0; i < x ; i ++ ){
                data.news[i].created_at = data.news[i].created_at.substr(0,10);
            }

             var array = data.news.map(function(article,index){
                var array = {};

              array[index] = article;
              return array;

            });


            this.setState({first: array[0][0]});
            this.setState({second: array[1][1]});
            this.setState({third: array[2][2]});
            this.setState({forth: array[3][3]});
              console.log(this.state.news);
          } else {
            alert("Записи новостей не удалось найти в базе данных!");
          }
        }.bind(this);
        xhr.send();

    }

  render() {
    var roles = JSON.parse(sessionStorage.getItem('userRoles'));

    return (
      <div className="section">
        <div className="container">
          <div className="row body" style={{paddingRight: '15px'}}> 
            
            <UncontrolledCarousel items={this.state.items} className="carousel-padding no-border" />

            <div className="container home-page col-md-12 wow fadeInUp" data-wow-duration="1.5s">
              <div className="row">
                <div className="col-md-12 col-xs-12 black-main text-center">
                  <h4 >{e.news}</h4>
                  <span><img src="images/line.png" /></span>
                  
                  <div className="card-deck">
                    <div className="card  mt-4 mb-4 wow fadeInLeft" data-wow-duration="1.5s">
                      <div className="card-body">
                        <h5 className="text-muted card-text">{e.newscalendar}</h5>

                          <div>
                            <Calendar
                              onChange={this.onChange}
                              value={this.state.date}
                            />
                          </div>
                        </div>
                    </div>
                      
                    <div className="card mt-4 mb-4 wow fadeInUp" data-wow-duration="1.5s">
                      <div className="list-group">


                        <div href="#" className="list-group-item flex-column align-items-start ">
                          <div className="d-flex w-100 left-content-between">
                              <img className="news-icon" src="./images/clock-icon.png" alt="Время выхода" />
                              <p className="news-date text-muted font-weight-light">{this.state.first.created_at}</p>
                          </div>
                            
                          <h6 className="news-title text-left text-muted mb-1">{this.state.first.title}</h6>
                          <p className="news-text text-left mt-2 mb-1">{this.state.first.description}</p>
                          <div className="dropdown-divider"></div>
                          <a href={'/#/NewsArticle/' + this.state.first.id}><small className="float-right text-warning view-more font-weight-bold">{e.moreinfo}</small></a>
                        </div>

                          
                        <div href="#" className="list-group-item  flex-column align-items-start ">
                          <div className="d-flex w-100 left-content-between">
                              <img className="news-icon" src="./images/clock-icon.png" alt="Время выхода" />
                              <p className="news-date text-muted font-weight-light">{this.state.second.created_at}</p>
                          </div>
                            
                          <h6 className="news-title text-left text-muted mb-1">{this.state.second.title}</h6>
                          <p className="news-text text-left mt-2 mb-1">{this.state.second.description} </p>
                          <div className="dropdown-divider"></div>
                          <a href={'/#/NewsArticle/' + this.state.second.id}><small className="float-right text-warning view-more font-weight-bold">{e.moreinfo}</small></a>
                        </div>


                      </div>
                    </div>
                      
                    <div className="card mt-4 mb-4 wow fadeInRight" data-wow-duration="1.5s">
                      <div className="list-group">
                          
                        <div href="#" className="list-group-item flex-column align-items-start ">
                          <div className="d-flex w-100 left-content-between">
                              <img className="news-icon" src="./images/clock-icon.png" alt="Время выхода" />
                              <p className="news-date text-muted font-weight-light">{this.state.third.created_at}</p>
                          </div>
                            
                          <h6 className="news-title text-left text-muted mb-1">{this.state.third.title}</h6>
                          <p className="news-text text-left mt-2 mb-1">{this.state.third.description} </p>
                          <div className="dropdown-divider"></div>
                          <a href={'/#/NewsArticle/' + this.state.third.id}><small className="float-right text-warning view-more font-weight-bold">{e.moreinfo}</small></a>
                        </div>
                          
                        <div href="#" className="list-group-item  flex-column align-items-start ">
                          <div className="d-flex w-100 left-content-between">
                              <img className="news-icon" src="./images/clock-icon.png" alt="Время выхода" />
                              <p className="news-date text-muted font-weight-light">{this.state.forth.created_at}</p>
                          </div>
                            
                          <h6 className="news-title text-left text-muted mb-1">{this.state.forth.title}</h6>
                          <p className="news-text text-left mt-2 mb-1">{this.state.forth.description}</p>
                          <div className="dropdown-divider"></div>
                          <a href={'/#/NewsArticle/' + this.state.forth.id}><small className="float-right text-warning view-more font-weight-bold">{e.moreinfo}</small></a>
                        </div>
                      </div>
                    </div>

                  </div>
                  <a className="allnews" aria-hidden="true" href="/#/NewsAll">
                      Все новости <span className="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>
                  </a>
                </div>
              </div>
            </div>

            <div className="container home-page col-md-12 wow fadeInUp" data-wow-duration="1.5s">
              <div className="row">
                <div className="col-md-12 col-xs-12 black-main text-center">
                  <h4 >{e.public_services}</h4>
                  <span><img src="images/line.png" /></span>
                    
                  <div className="card-deck wow fadeInUp" data-wow-duration="1.5s">   
                    <div className="card mt-4 mb-4 info-block"> 
                      <div className="card-image card-color-1">
                        <div className="image-border">
                          <img src="./images/1.svg" alt="true" />
                        </div>

                      </div>
                      <div className="card-body">
                        <p className="card-text">
                            {e.firstblock}
                        </p>
                      </div>
                      <div className="card-button">
                        {/*<button className="btn btn-danger bg-danger text-white font-weight-bold">Подать заявку</button>*/}
                        {this.state.tokenExists && <NavLink to={"/"} replace className="btn btn-primary">{e.apply}</NavLink>}
                        {!this.state.tokenExists && <AlertModal />}
                      </div>
                    </div>
                      
                    <div className="card  mt-4 mb-4 ">  
                      <div className="card-image card-color-2">
                        <div className="image-border">
                          <img src="./images/2.svg" alt="true" />
                        </div>
                      </div>
                          
                      <div className="card-body">
                        <p className="card-text">
                            {e.secondblock}
                        </p>
                      </div>
                      <div className="card-button">
                        {/*<button className="btn btn-danger bg-danger text-white font-weight-bold">Подать заявку</button>*/}
                        {this.state.tokenExists && this.state.rolename === 'Admin' && <NavLink to={"/admin"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Citizen' && <NavLink to={"/citizen"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Region' &&  <NavLink to={"/urban"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Head' &&  <NavLink to={"/head"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Electricity' &&  <NavLink to={"/providerelectro"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Gas' &&  <NavLink to={"/providergas"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Heat' &&  <NavLink to={"/providerheat"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Water' &&  <NavLink to={"/providerwater"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'ApzDepartment' &&  <NavLink to={"/apz"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {this.state.tokenExists && this.state.rolename === 'Engineer' &&  <NavLink to={"/engineer"} replace className="btn btn-primary">Подать заявку</NavLink>}
                        {!this.state.tokenExists && <AlertModal />}
                      </div>   
                    </div>
                      
                    <div className="card  mt-4 mb-4 ">
                      <div className="card-image card-color-3">
                        <div className="image-border">
                          <img src="./images/3.svg" alt="true" />
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-text">
                            {e.thirdblock}
                        </p>
                      </div>
                      <div className="card-button">
                        {/*<button className="btn btn-danger bg-danger text-white font-weight-bold">Подать заявку</button>*/}
                        {this.state.tokenExists && <NavLink to={"/"} replace className="btn btn-primary">{e.apply}</NavLink>}
                        {!this.state.tokenExists && <AlertModal />}
                      </div>
                    </div>     
                  </div>
                    
                  <div className="card-deck wow fadeInUp" data-wow-duration="1.5s">
                    <div className="card mt-4 mb-4 ">
                      <div className="card-image card-color-4">
                        <div className="image-border">
                          <img src="./images/4.svg" alt="true" />
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-text">
                            {e.fourthblock}
                        </p>
                      </div>
                      <div className="card-button">
                        {/*<button className="btn btn-danger bg-danger text-white font-weight-bold">Подать заявку</button>*/}
                        {this.state.tokenExists && <NavLink to={"/"} replace className="btn btn-primary">{e.apply}</NavLink>}
                        {!this.state.tokenExists && <AlertModal />}
                      </div>
                    </div>
                      
                    <div className="card  mt-4 mb-4 ">
                      <div className="card-image card-color-5">
                        <div className="image-border">
                          <img src="./images/5.svg" alt="true" />
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-text">
                            {e.fifthblock}
                        </p>
                      </div>
                      <div className="card-button">
                        {/*<button className="btn btn-danger bg-danger text-white font-weight-bold">Подать заявку</button>*/}
                        {this.state.tokenExists && <NavLink to={"/"} replace className="btn btn-primary">{e.apply}</NavLink>}
                        {!this.state.tokenExists && <AlertModal />}
                      </div>
                    </div>
                      
                    <div className="card mt-4 mb-4 ">
                      <div className="card-image card-color-6">
                        <div className="image-border">
                          <img src="./images/6.svg" alt="true" />
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-text">
                            {e.sixthblock}
                        </p>
                      </div>
                      <div className="card-button">
                        {/*<button className="btn btn-danger bg-danger text-white font-weight-bold">Подать заявку</button>*/}
                        {this.state.tokenExists && <NavLink to={"/"} replace className="btn btn-primary">{e.apply}</NavLink>}
                        {!this.state.tokenExists && <AlertModal />}
                      </div>
                    </div>  
                  </div>
                </div>
              </div>
            </div>
                
            
                   
            <div className="container home-page col-md-12 wow fadeInUp" data-wow-duration="1.5s">
              <div className="row">
                <div className="col-md-12 col-xs-12 black-main text-center">
                  <h4>{e.questionsanswers}</h4>
                  <span><img src="./images/line.png" /></span>
                  
                  <div className="card-deck comment">
                    <div className="card mt-4 mb-4">
                        <div className="card-body">
                            <div className="card-text">
                                <h6 className="dearUser text-muted">{e.dearuser}</h6>
                                <p>{e.messageforuser}</p>
                                <div className="dropdown-divider"></div>
                                <span><a className="text-warning font-weight-bold view-more" href="#">{e.viewall}</a></span>
                            </div>
                        </div>
                    </div>  
                  </div>
                </div>
              </div>
            </div>   
                
            <div className="container home-page col-md-12 wow fadeInUp" data-wow-duration="1.5s">
              <div className="row">
                <div className="col-md-12 col-xs-12 black-main text-center">
                  <span><img className="col-md-12" src="./images/line-divider.png" /></span>
                  
                  <div className="card-deck">
                    <div className="slick-initialized slick-slider">
                      <div className="card-body col-md-12 strategy">
                        <a href="http://www.akorda.kz/kz" target="_blank"><img src="./images/strategy/akorda-kz.jpg" /></a>
                        <a href="http://www.akorda.kz/ru/addresses/addresses_of_president/poslanie-prezidenta-respubliki-kazahstan-nnazarbaeva-narodu-kazahstana-31-yanvarya-2017-g" target="_blank"><img src="./images/strategy/zholdau.jpg" /></a>
                        <a href="http://kyzmet.gov.kz/ru/kategorii/100-konkretnyh-shagov" target="_blank"><img src="./images/strategy/100shagov.jpg" /></a>
                        <a href="https://strategy2050.kz/" target="_blank"><img src="./images/strategy/kaz2050.png" /></a>
                        <a href="http://ruh.kz/" target="_blank"><img src="./images/strategy/ruhan_zhangyru.jpg" /></a>
                        <a href="http://www.akorda.kz/ru/events/akorda_news/press_conferences/statya-glavy-gosudarstva-vzglyad-v-budushchee-modernizaciya-obshchestvennogo-soznaniya" target="_blank"><img src="./images/strategy/modernization_ru.png" /></a>
                        <a href="https://almaty.gov.kz/page.php?page_id=3239&lang=1" target="_blank"><img src="./images/strategy/almaty2020.png" /></a>
                        <a href="http://egov.kz/cms/ru" target="_blank"><img src="./images/strategy/egov.png" /></a>
                        {localStorage.getItem('lang') === 'ru' && <a href="https://www.almaty.gov.kz/page.php?page_id=3447&lang=1&article_id=39871" target="_blank"><img src="/images/strategy/prom_revolution_4_ru.jpg" /></a>}
                        {localStorage.getItem('lang') === 'kk' && <a href="https://www.almaty.gov.kz/page.php?page_id=3498&lang=3" target="_blank"><img src="/images/strategy/prom_revolution_4_kz.jpg" /></a>}  
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


// this Modal is for alert, if NCLayer is off
class AlertModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <div>
        <Button className="btn btn-danger bg-danger text-white font-weight-bold" style={{textTransform:'none'}} onClick={this.toggle}>{e.apply}</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>{e.info}</ModalHeader>
          <ModalBody>
              {e.youneed} &nbsp;
            <NavLink to={"/login"} className="navLink" replace>
                {e.login}
            </NavLink> {e.or}  &nbsp;
            <NavLink to={"/register"} className="navLink" replace>
                {e.logup}
            </NavLink> {e.needkz}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggle}>{e.close}</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}