import React from 'react';
import {hot} from 'react-hot-loader';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import PanelHeaderBack from '@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Header from '@vkontakte/vkui/dist/components/Header/Header';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Footer from '@vkontakte/vkui/dist/components/Footer/Footer';
import Link from '@vkontakte/vkui/dist/components/Link/Link';
import ActionSheet from '@vkontakte/vkui/dist/components/ActionSheet/ActionSheet';
import ActionSheetItem from '@vkontakte/vkui/dist/components/ActionSheetItem/ActionSheetItem';
import { platform, IOS } from '@vkontakte/vkui/dist/lib/platform';

import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';
import Icon24Services from '@vkontakte/icons/dist/24/services';
import Icon24FavoriteOutline from '@vkontakte/icons/dist/24/favorite_outline';
import Icon24Favorite from '@vkontakte/icons/dist/24/favorite';

import copyTextToClipboard from '../../helpers';

const osname = platform();

class Passwords extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      count: '0 паролей'
    }

    this.getCount = this.getCount.bind(this);
  }
  componentDidMount() {
    if(localStorage.list) {
      let list = JSON.parse(localStorage.list),
          list1 = list.filter(item => item.star),
          list2 = list.filter(item => !item.star);

      list = list1.concat(list2);
      this.updateList(list);
    } else {
      this.updateList([]);
    }
  }

  updateList = list => {
    this.setState({ list });
    this.getCount(list);
  }
  updateItem = (name, star) => {
    let list = this.state.list;
    for(let i = 0; i < list.length; i++) {
      if(list[i].name !== name) continue;

      list[i].star = star;
      this.updateList(list);

      localStorage.list = JSON.stringify(list);
    }
  }

  getCount(list) {
    if(list.length > 0) {
      const words = ['пароль', 'пароля', 'паролей']
      this.setState({ count: `${list.length} ${words[this.getIndexByCount(list.length)]}` })
    } else {
      this.setState({ count: `0 паролей` })
    }
  }
  getIndexByCount(c) {
    let i = 2;

    c = c.toString();
    if(c.slice(-1) === '1') {
      if(c.slice(-2) === '11') {
        i = 2;
      } else {
        i = 0;
      }
    } else if(c.slice(-1) === '2' || c.slice(-1) === '3' || c.slice(-1) === '4') {
      if(c.slice(-2) === '12' || c.slice(-2) === '13' || c.slice(-2) === '14') {
        i = 2;
      } else {
        i = 1;
      }
    } else if(c.slice(-1) === '5' || c.slice(-1) === '6' || c.slice(-1) === '7' || c.slice(-1) === '8' || c.slice(-1) === '9' || c.slice(-1) === '0') {
      i = 2;
    }

    return i;
  }

  openActionSheet = () => this.props.updateState({
    homePopout:
      <ActionSheet
        onClose={() => this.props.updateState({ homePopout: null })}
        title="Действия с паролями"
        text="Выберите желаемое действие"
      >
        <ActionSheetItem autoclose onClick={() => this.handleClose('edit')}>Редактировать пароли</ActionSheetItem>
        <ActionSheetItem autoclose onClick={() => this.handleClose('list')}>Редактировать порядок</ActionSheetItem>
        <ActionSheetItem autoclose theme="destructive" onClick={() => this.handleClose('delete')}>Удалить пароли</ActionSheetItem>
        {osname === IOS && <ActionSheetItem autoclose theme="cancel">Отмена</ActionSheetItem>}
      </ActionSheet>
  })
  handleClose = (type) => {
    switch(type) {
      case 'edit': this.props.go('editpasswords'); break;

      case 'list': this.props.go('editlist'); break;

      case 'delete': this.props.go('deletepasswords'); break;

      default: console.error('неизвестное значение type:', type);
    }
  }

  launchPasswordActions = item => this.props.updateState({
    homePopout:
      <ActionSheet
        onClose={() => this.props.updateState({ homePopout: null })}
        title={`Аккаунт «${item.name}»`}
        text="Выберите действие"
      >
        <ActionSheetItem autoclose onClick={() => copyTextToClipboard(item.pass)}>Скопировать пароль</ActionSheetItem>
        <ActionSheetItem autoclose onClick={() => this.updateItem(item.name, !item.star)}>{item.star ? 'Удалить из избранного' : 'Добавить в избранное'}</ActionSheetItem>
        <ActionSheetItem autoclose onClick={() => {
          this.props.updateState({ currentItem: item });
          this.props.go('editpassword');
        }}>
          Редактировать аккаунт
        </ActionSheetItem>
        <ActionSheetItem autoclose theme="destructive" onClick={() => this.props.go('deletepasswords')}>Удалить аккаунт</ActionSheetItem>
        {osname === IOS && <ActionSheetItem autoclose theme="cancel">Отмена</ActionSheetItem>}
      </ActionSheet>
  });

  render() {
    return (
      <Panel id={this.props.id}>
        <PanelHeader left={<PanelHeaderBack onClick={() => this.props.go('', true)} />}>Список паролей</PanelHeader>
        <Group>
          <Header level="2" aside={this.state.list.length > 0 ? <Link style={{ cursor: 'pointer' }} onClick={() => this.openActionSheet()}>Действия</Link> : null}>
            {this.state.count}
          </Header>
          <Cell before={<Avatar size={48} style={{ background: 'transparent' }}><Icon28AddOutline fill="var(--accent)" /></Avatar>} onClick={() => this.props.changeView('add')}><span style={{ color: 'var(--accent)' }}>Добавить пароль</span></Cell>
          {this.state.list.length > 0 && this.state.list.map((row, i) => (
            <Cell
              key={i}
              before={<Avatar><Icon24Services /></Avatar>}
              asideContent={
                row.star ?
                <Icon24Favorite fill="#FFA000" /> :
                <Icon24FavoriteOutline />
              }
              description={row.pass}
              onClick={() => this.launchPasswordActions(row)}
            >
              {row.name}
            </Cell>
          ))}
        </Group>
        {this.state.list.length <= 0 && <Footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Ничего не найдено</Footer>}
      </Panel>
    );
  }
}

export default hot(module)(Passwords);
