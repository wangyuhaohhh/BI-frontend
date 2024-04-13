import { listMyChartByPageUsingPOST } from '@/services/whbi/chartController';
import React,{ useEffect,useState } from 'react';
import { Avatar, Card, List, message } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useModel } from '@@/exports';
import Search from 'antd/es/input/Search';


/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current:1,
    pageSize:4,
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const {initialState}=useModel('@@initialState');
  const {currentUser}=initialState??{};
  const [chartList, setCharList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        setCharList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        //去除图表标题
        if (res.data.records){
          res.data.records.forEach(data=>{
            const chartOption=JSON.parse(data.genChart??'{}');
            chartOption.title=undefined;
            data.genChart=JSON.stringify(chartOption);
          })
        }
      } else {
        message.error('获取图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败,' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  return (
    <div className="my-chart-page">
      <div>
        <Search placeholder="请输入图标名称" enterButton loading={loading} onSearch={(value)=>{
          //设置搜索条件
          setSearchParams({
            ...searchParams,
            name:value,
          })
        }}/>
      </div>
      <div style={{marginBottom:16}}/>
      <List
        grid={{
          gutter:16,
          column:2,
          xs:1,
          sm:1,
          md:1,
          lg:2,
          xl:2,
          xxl:2,
        }}
        pagination={{
          onChange: (page,pageSize) => {
            setSearchParams({
              ...searchParams,
              current:page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total:total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{width:'100%'}}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser&&currentUser.userAvatar} />}
                title={item.name}
                description={item.chartType?('图表类型：'+item.chartType):undefined}
              />
              <div style={{marginBottom:16}}/>
              <p>{'分析目标：'+item.goal}</p>
              <div style={{marginBottom:16}}/>
              <ReactECharts option={item.genChart&&JSON.parse(item.genChart)}/>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
