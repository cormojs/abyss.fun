import React from 'react';
import ComposeFormContainer from './containers/compose_form_container';
import NavigationContainer from './containers/navigation_container';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { mountCompose, unmountCompose } from '../../actions/compose';
import { Link } from 'react-router-dom';
import { injectIntl, defineMessages } from 'react-intl';
import SearchContainer from './containers/search_container';
import Motion from '../ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import SearchResultsContainer from './containers/search_results_container';
import { changeComposing } from '../../actions/compose';

import Button from '../../components/button';

const NarakMojiHenkan = class extends React.PureComponent {

  handleClick() {
    const textarea = document.querySelector('textarea.autosuggest-textarea__textarea');
    textarea.value = textarea.innerHTML
      // hiragana to katakana
      .replace(/[\u3041-\u3096]/g, s => String.fromCodePoint(s.charCodeAt(0) + 0x60))
      // abyss to naraku-moji
      .replace(/奈落|深淵|アビス/ig, s => '\u200b:nrk6df5:\u200b')
      // katakana to naraku-moji
      .replace(/[\u30a1-\u30ef\u30f2\u30f3\u30fc\u6df5\u6e15\u866b\u82b1\u68ee\u96e8\u6d77]/g, s => '\u200b:nrk' + s.codePointAt(0).toString(16) + ':\u200b')
      // trim duplicate zero-width-space
      .replace(/\u200b+/g, '\u200b');
    return false;
  }

  render() {
    return (
      <div>
        <Button text='奈落文字に変換する' onClick={this.handleClick} block />
      </div>
    );
  }

};

const messages = defineMessages({
  start: { id: 'getting_started.heading', defaultMessage: 'Getting started' },
  home_timeline: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  notifications: { id: 'tabs_bar.notifications', defaultMessage: 'Notifications' },
  public: { id: 'navigation_bar.public_timeline', defaultMessage: 'Federated timeline' },
  consideration: { id: 'navigation_bar.consideration_timeline', defaultMessage: 'Consideration timeline' },
  community: { id: 'navigation_bar.community_timeline', defaultMessage: 'Local timeline' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
});

const mapStateToProps = state => ({
  columns: state.getIn(['settings', 'columns']),
  showSearch: state.getIn(['search', 'submitted']) && !state.getIn(['search', 'hidden']),
});

@connect(mapStateToProps)
@injectIntl
export default class Compose extends React.PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    columns: ImmutablePropTypes.list.isRequired,
    multiColumn: PropTypes.bool,
    showSearch: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.props.dispatch(mountCompose());
  }

  componentWillUnmount() {
    this.props.dispatch(unmountCompose());
  }

  onFocus = () => {
    this.props.dispatch(changeComposing(true));
  }

  onBlur = () => {
    this.props.dispatch(changeComposing(false));
  }

  render() {
    const { multiColumn, showSearch, intl } = this.props;

    let header = '';

    if (multiColumn) {
      const { columns } = this.props;
      header = (
        <nav className='drawer__header'>
          <Link to='/getting-started' className='drawer__tab' title={intl.formatMessage(messages.start)} aria-label={intl.formatMessage(messages.start)}><i role='img' className='fa fa-fw fa-asterisk' /></Link>
          {!columns.some(column => column.get('id') === 'HOME') && (
            <Link to='/timelines/home' className='drawer__tab' title={intl.formatMessage(messages.home_timeline)} aria-label={intl.formatMessage(messages.home_timeline)}><i role='img' className='fa fa-fw fa-home' /></Link>
          )}
          {!columns.some(column => column.get('id') === 'NOTIFICATIONS') && (
            <Link to='/notifications' className='drawer__tab' title={intl.formatMessage(messages.notifications)} aria-label={intl.formatMessage(messages.notifications)}><i role='img' className='fa fa-fw fa-bell' /></Link>
          )}
          {!columns.some(column => column.get('id') === 'COMMUNITY') && (
            <Link to='/timelines/public/local' className='drawer__tab' title={intl.formatMessage(messages.community)} aria-label={intl.formatMessage(messages.community)}><i role='img' className='fa fa-fw fa-users' /></Link>
          )}
          {!columns.some(column => column.get('id') === 'HASHTAG') && (
            <Link to='/timelines/tag/メイドインアビス考察班' className='drawer__tab' title={intl.formatMessage(messages.consideration)} aria-label={intl.formatMessage(messages.consideration)}><i role='img' className='fa fa-fw fa-comments' /></Link>
          )}
          <a href='/settings/preferences' className='drawer__tab' title={intl.formatMessage(messages.preferences)} aria-label={intl.formatMessage(messages.preferences)}><i role='img' className='fa fa-fw fa-cog' /></a>
          <a href='/auth/sign_out' className='drawer__tab' data-method='delete' title={intl.formatMessage(messages.logout)} aria-label={intl.formatMessage(messages.logout)}><i role='img' className='fa fa-fw fa-sign-out' /></a>
        </nav>
      );
    }

    return (
      <div className='drawer'>
        {header}

        <SearchContainer />

        <div className='drawer__pager'>
          <div className='drawer__inner' onFocus={this.onFocus}>
            <NavigationContainer onClose={this.onBlur} />
            <ComposeFormContainer />
            <NarakMojiHenkan />
            <div className='mastodon' />
          </div>

          <Motion defaultStyle={{ x: -100 }} style={{ x: spring(showSearch ? 0 : -100, { stiffness: 210, damping: 20 }) }}>
            {({ x }) =>
              <div className='drawer__inner darker' style={{ transform: `translateX(${x}%)`, visibility: x === -100 ? 'hidden' : 'visible' }}>
                <SearchResultsContainer />
              </div>
            }
          </Motion>
        </div>
      </div>
    );
  }

}
