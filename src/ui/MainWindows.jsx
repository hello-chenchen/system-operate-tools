import React from 'react';
import { Input, List } from 'antd';  //FIXED: https://github.com/ant-design/ant-design/issues/4618#issuecomment-309258697
import 'antd/dist/antd.css';
import { readText, writeText } from '../util/clipboard/Clipboard';
import { DataBase } from '../util/DataBase';
import '../scss/common.scss';

class MainWindows extends React.Component {
    constructor(props) {
        super(props);
        this.lastCBText = '';
        this.setProps = new Set();
        this.state = {
            focusIndex: -1,
            cbTextArray: []
        };
        this.database = new DataBase('./clipboard.db');
        this.searchInput = React.createRef();
    }

    async initHandle() {
        let items = await this.database.init();
        this.reRenderList(items);
    }

    reRenderList(items = []) {
        console.log('reRenderList start:');
        items.forEach((item) => {
            this.setProps.add(item.id);
        });

        this.cbTextArray = items;
        this.setState({
            cbTextArray: items
        });

        console.log('reRenderList end.');
    }

    render() {
        return (
            //TODO: Vlist from react-virtualized is better to handle massive data, for more info: https://ant.design/components/list
            <div class="main-windows">
                <Input
                    placeholder="search"
                    ref={this.searchInput}
                    onChange={e =>  this.searchClip(e.target.value)}
                    onKeyDown={this.inputKeyDown.bind(this)}
                />
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.cbTextArray}
                    renderItem={(item, index) => (
                        <List.Item
                            className={this.state.focusIndex == index ? 'selected-item' : ''}
                            actions={[<a href="#" onClick={() => this.deleteClipItem(item.id)}>delete</a>]}
                        >
                            <List.Item.Meta
                                title={item.content}
                            />
                        </List.Item>
                    )}
                />
            </div>
        );
    }

    inputKeyDown (e) {
        console.log('inputKeyUp: ');
        console.log(e);
        let focusIndex = this.state.focusIndex;
        if(e.keyCode == 40 && focusIndex < this.state.cbTextArray.length - 1) {
            focusIndex++;
        } else if(e.keyCode == 38 && focusIndex > -1) {
            focusIndex--;
        } else if(e.keyCode == 13 && focusIndex != -1) {
            let cbContext = this.state.cbTextArray[focusIndex];
            writeText(cbContext.content);
            focusIndex = 0;
        }

        this.setState({
            focusIndex: focusIndex
        });
    }

    async componentDidMount () {
        this.initHandle();
        this.timerID = setInterval(
            () => this.listenCBEvent(),
            1000
        );
        this.searchInput.current.focus();
    }

    async listenCBEvent() {
        let cbContext = readText();
        if(cbContext.content == this.lastCBText) {
            console.log('listenCBEvent same to the latest!');
            return;
        }
        this.lastCBText = cbContext.content;

        let array = this.state.cbTextArray;
        if(this.setProps.has(cbContext.id)) {
            // console.log('listenCBEvent update context id: ' + cbContext.id + ' time: ' + cbContext.time + ' content: ' + cbContext.content);
            this.database.update(cbContext);
            this.setProps.delete(cbContext.id);
            array = array.filter(element => element.id != cbContext.id);
        } else {
            // console.log('listenCBEvent insert context id: ' + cbContext.id + ' time: ' + cbContext.time + ' content: ' + cbContext.content);
            this.database.insert(cbContext);
        }

        this.setProps.add(cbContext.id);

        array.unshift(cbContext);
        this.setState({
            cbTextArray: array
        });
    }

    async searchClip (searchIput) {
        let items = await this.database.filter(searchIput);
        this.reRenderList(items);
    }

    deleteClipItem (id) {
        this.database.delete(id);
        this.setProps.delete(id);

        this.setState({
            cbTextArray: this.state.cbTextArray.filter(element => element.id != id)
        });
    }
}

export default MainWindows;