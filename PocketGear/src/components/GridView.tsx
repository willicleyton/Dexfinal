import React, { PureComponent } from 'react';
import ListView from 'deprecated-react-native-listview';
import {
  Platform,
  Dimensions,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  ListViewDataSource,
} from 'react-native';

type Props = React.ComponentProps<typeof ListView> & {
  data: any[];
  spacing: number;
  pageSize?: number;
  getNumberOfColumns: (width: number) => number;
  renderRow: (
    rowData: any,
    rowID: string,
    highlightRow: React.ReactText
  ) => React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  contentContainerStyle?: any;
  style?: StyleProp<ViewStyle>;
};

type State = {
  dataSource: ListViewDataSource;
  containerWidth: number;
};

export default class GridView extends PureComponent<Props, State> {
  static defaultProps = {
    getNumberOfColumns: () => 1,
    spacing: 0,
  };

  state: State = {
    dataSource: new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    }),
    containerWidth: Dimensions.get('window').width,
  };

  UNSAFE_componentWillMount() {
    this.setState(state => ({
      dataSource: state.dataSource.cloneWithRows(
        this._processData(state.containerWidth, this.props)
      ),
    }));
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    this.setState(state => ({
      dataSource: state.dataSource.cloneWithRows(
        this._processData(state.containerWidth, nextProps)
      ),
    }));
  }

  scrollTo(options: any) {
    this._root.scrollTo(options);
  }

  _root: any;

  _renderRow = (rowData: any, rowID: string, highlightRow: React.ReactText) => {
    return (
      <View style={rowData.style}>
        {this.props.renderRow(rowData.tile, rowID, highlightRow)}
      </View>
    );
  };

  _processData = (containerWidth: number, props: Props) => {
    const { getNumberOfColumns, spacing, data } = props;
    const style = {
      width:
        (containerWidth - spacing) / getNumberOfColumns(containerWidth) -
        spacing,
      margin: spacing / 2,
    };
    return data.map(tile => ({
      tile,
      style,
    }));
  };

  _handleLayout = (e: any) => {
    if (this.props.onLayout) {
      this.props.onLayout(e);
    }

    if (this.state.containerWidth === e.nativeEvent.layout.width) {
      return;
    }

    const containerWidth = e.nativeEvent.layout.width;

    this.setState(state => ({
      containerWidth,
      dataSource: state.dataSource.cloneWithRows(
        this._processData(containerWidth, this.props)
      ),
    }));
  };

  _setRef = (c: any) => (this._root = c);

  render() {
    return (
      <ListView
        {...this.props}
        removeClippedSubviews={Platform.OS !== 'ios'}
        enableEmptySections={false}
        dataSource={this.state.dataSource}
        onLayout={this._handleLayout}
        renderRow={this._renderRow}
        contentContainerStyle={[
          styles.grid,
          { padding: this.props.spacing / 2 },
          this.props.contentContainerStyle,
        ]}
        ref={this._setRef}
      />
    );
  }
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
