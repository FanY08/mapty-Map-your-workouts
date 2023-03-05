# mapty-Map-your-workouts
标记运动锻炼地图。 JavaScript learning

<h4>设计目的：</h4>
  <p>学习JavaScript，加深理解及应用。额外借助百度地图API实现相应功能</p>

<h4>功能：</h4>
    <ul>
            <li>运行时需要授权用户位置，才可以进行运动标记</li>
            <li>点击地图任意位置，在左侧添加运动信息，即可实现运动标记</li>
            <li>点击左侧任意一个运动事件，右侧地图自动移动至响应地点</li>
        </ul>
       
<h4>可扩展功能：</h4>
    <ul>
        <li>添加'edit'功能</li>
        <li>添加'delete' 'deleteAll'功能</li>
        <li>添加'sort'功能</li>
        <li>绘制运动路线</li>
        <li>根据'位置描述'添加标记</li>
        <li>利用其它API，添加天气功能</li>
    </ul>
   
<h4>使用中存在问题：</h4>
    <ul>
            <li>运行时需要授权用户位置，才可以进行运动标记</li>
            <li>运行时会出现跨域报错，但不影响基本标记功能（也可以本地利用live-server打开，不会报错）</li>
            <li>使用的是localStorage存储当前用户的数据</li>
        </ul>
