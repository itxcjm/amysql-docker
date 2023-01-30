/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmfileUploader  
 *
 */
var AmfileUploader_arr = [];
var UpTimeObject = {'list':[]};
var progress_now = null;
var upload_file = function (upload_id, url, max_size, picker, amfile_uplist, amfile_result)
{
    AmfileUploader_arr[upload_id] = WebUploader.create({
        resize: false,
        chunkRetry: 3,
        threads: 1,
        runtimeOrder: 'html5',
        auto: true,
        fileSingleSizeLimit: max_size,
        accept: {
            extensions: '*'
        },
        server: url,
        pick: '#' + picker, //  <span id="picker"> 选择文件 </span>
        amfile_uplist : amfile_uplist,
        amfile_result : amfile_result
    });
    var AmfileUploader = AmfileUploader_arr[upload_id];

    AmfileUploader.on( 'fileQueued', function( file ) {
        var p = new AmfileUploader.progress(file, this.options.amfile_uplist);
        progress_now = p;
        p.setShow(true);
        p.setUploadState(2);
    });

    AmfileUploader.on( 'uploadSuccess', function( file, data ) {
        if(data.status == '1')
        {
            var progress = new AmfileUploader.progress(file, this.options.amfile_uplist);
            progress.percentSpan.innerHTML = '<font color="green">上传成功。</font>';
            G(this.options.amfile_result).innerHTML = data.msg;
        }
    });

    AmfileUploader.on( 'uploadProgress', function( file, percentage ) {
        // console.log('AMFile:uploadProgress');
        var progress = new AmfileUploader.progress(file, this.options.amfile_uplist);
        progress.setUploadState(3);

        // 更新速度与时间
        var name_arr = file.id.split('_');
        var now_id = parseInt(name_arr[2]);     // 获得当前ID
        var upo = {};                           // 每进程信息
        upo.now_time = (new Date()).valueOf();
        upo.bytesLoaded = file.size*percentage;

        var bytesTotal = file.size;
        var bytesLoaded = upo.bytesLoaded;
        
        if (typeof(UpTimeObject.list[now_id]) != 'object')
        {
            UpTimeObject.list[now_id] = {};
            UpTimeObject.list[now_id].Progress = [];
            UpTimeObject.list[now_id].start_time = upo.now_time;
            UpTimeObject.list[now_id].bytesTotal = bytesTotal;
        }

        var p_l = UpTimeObject.list[now_id].Progress.length;
        if(UpTimeObject.list[now_id].Progress[p_l-1] && UpTimeObject.list[now_id].Progress[p_l-1].bytesLoaded == upo.bytesLoaded)
            return;

        UpTimeObject.list[now_id].Progress.push(upo);

        var p_l = UpTimeObject.list[now_id].Progress.length;
        if (p_l >= 2)
        {
            var use_time = parseInt(upo.now_time) - parseInt(UpTimeObject.list[now_id].Progress[p_l-2].now_time);       // 使用时间
            var up_size = parseInt(upo.bytesLoaded) - parseInt(UpTimeObject.list[now_id].Progress[p_l-2].bytesLoaded);  // 上传了多少

            progress.setTimeProgress(use_time, up_size, bytesLoaded, bytesTotal);   // 时间进行信息更新
        }
        progress.setProgress((percentage*100).toFixed(2));          // 设置上传百分比
        // console.log(percentage*100-0.01);
    });
    AmfileUploader.on( 'uploadAccept', function( obj, data ) {
        // console.log('AMFile:uploadAccept');
        // 已经上传
        var name_arr = obj.file.id.split('_');
        var now_id = parseInt(name_arr[2]);     // 获得当前ID
        if(!UpTimeObject.list[now_id])
        {
            var progress = new AmfileUploader.progress(obj.file, this.options.amfile_uplist);
            if(obj.chunk == obj.chunks -1)
           		progress.setComplete(1);  // 上传完成
            if(data.status == '0')
            {
            	progress.SecondsRemaining.innerHTML = '<font color="red">' + data.msg + '</font>';
            	return;
            }
            return;
        }

        var last_key = UpTimeObject.list[now_id].Progress.length - 1;
        var use_time = (UpTimeObject.list[now_id].Progress[last_key].now_time - UpTimeObject.list[now_id].start_time);

        var progress = new AmfileUploader.progress(obj.file, this.options.amfile_uplist);
        if(data.status == '0')
        {
            progress.SecondsRemaining.innerHTML = '<font color="red">' + data.msg + '</font>';
        	return;
        }
        if(obj.chunk == obj.chunks -1)
        	progress.setComplete(use_time);  // 上传完成
    });

    AmfileUploader.on( 'uploadError', function( file ) {
         var progress = new AmfileUploader.progress(file, this.options.amfile_uplist);
         progress.percentSpan.innerHTML = '<font color="red">上传失败。</font>';
    });

    // 相关配置
    AmfileUploader.CustomSettings = {
            // progress object
            container_css: "progressobj",
            icoNormal_css: "IcoNormal",
            icoWaiting_css: "IcoWaiting",
            icoUpload_css: "IcoUpload",
            fname_css : "fle ftt",
            state_div_css : "statebarSmallDiv",
            state_bar_css : "statebar",
            percent_css : "ftt",
            href_delete_css : "ftt a",

            // 页面中不应出现以"cnt_"开头声明的元素
            s_cnt_progress: "cnt_progress",
            s_cnt_span_text : "fle",
            s_cnt_progress_statebar : "cnt_progress_statebar",
            s_cnt_progress_percent: "cnt_progress_percent",
            s_cnt_progress_uploaded : "cnt_progress_uploaded",
            s_cnt_progress_size : "cnt_progress_size"
    },

    // 上传进程
    AmfileUploader.progress = function (file, targetid) {
        //定义文件处理标识
        this.ProgressId = file.id;
        
        //获取当前容器对象
        this.fileProgressElement = document.getElementById(file.id);

        if (!this.fileProgressElement)
        {
            //container
            this.fileProgressElement = document.createElement("div");
            this.fileProgressElement.id = file.id;
            this.fileProgressElement.className = AmfileUploader.CustomSettings.container_css;

            //state button
            this.stateButton = document.createElement("input");
            this.stateButton.type = "button";
            this.stateButton.className = AmfileUploader.CustomSettings.icoWaiting_css;
            this.fileProgressElement.appendChild(this.stateButton);

            //filename
            this.filenameSpan = document.createElement("span");
            this.filenameSpan.className = AmfileUploader.CustomSettings.fname_css;
            this.filenameSpan.appendChild(document.createTextNode(file.name));
            this.filenameSpan.appendChild(document.createTextNode(' (' + this.formatUnits(file.size) + ')'));
            this.fileProgressElement.appendChild(this.filenameSpan);

            //statebar div
            this.stateDiv = document.createElement("span");
            this.stateDiv.className = AmfileUploader.CustomSettings.state_div_css;
            this.stateBar = document.createElement("span");
            this.stateBar.className = AmfileUploader.CustomSettings.state_bar_css;
            this.stateBar.innerHTML = "&nbsp;";
            this.stateBar.style.width = "0%";
            this.stateDiv.appendChild(this.stateBar);
            this.fileProgressElement.appendChild(this.stateDiv);

            //span percent
            this.percentSpan = document.createElement("span");
            this.percentSpan.className = AmfileUploader.CustomSettings.percent_css;
            this.percentSpan.style.marginTop = "10px";
            this.percentSpan.innerHTML = "等待上传中...";
            this.fileProgressElement.appendChild(this.percentSpan);

            //span velocity
            this.velocity = document.createElement("span");
            this.velocity.className = AmfileUploader.CustomSettings.percent_css;
            this.velocity.style.marginTop = "10px";
            this.velocity.innerHTML = "";
            this.fileProgressElement.appendChild(this.velocity);


            //span Seconds remaining
            this.SecondsRemaining = document.createElement("span");
            this.SecondsRemaining.className = AmfileUploader.CustomSettings.percent_css;
            this.SecondsRemaining.style.marginTop = "10px";
            this.SecondsRemaining.innerHTML = "";
            this.fileProgressElement.appendChild(this.SecondsRemaining);

            //delete href
            this.hrefSpan = document.createElement("a");
            this.hrefSpan.className = AmfileUploader.CustomSettings.href_delete_css;
            this.hrefControl = document.createElement("a");
            this.hrefControl.href = 'javascript:;';
            this.hrefControl.innerHTML = "删除";
            this.hrefControl.onclick = function()
            {
                AmfileUploader.cancelFile(file);
                document.getElementById(targetid).removeChild(document.getElementById(file.id));
            }
            this.hrefSpan.appendChild(this.hrefControl);
            this.fileProgressElement.appendChild(this.hrefSpan);

            //insert container
            document.getElementById(targetid).appendChild(this.fileProgressElement);
        }
        else
        {
            this.reset();
        }
    }
    // 控制上传进度对象是否显示
    AmfileUploader.progress.prototype.setShow = function(show)
    {
        this.fileProgressElement.style.display = show ? "" : "none";
    }
    // 设置状态按钮状态
    AmfileUploader.progress.prototype.setUploadState = function(state)
    {
        switch(state)
        {
            case 1:
                //初始化完成
                this.stateButton.className = AmfileUploader.CustomSettings.icoNormal_css;
                break;
            case 2:
                //正在等待
                this.stateButton.className = AmfileUploader.CustomSettings.icoWaiting_css;
                break;
            case 3:
                //正在上传
                this.stateButton.className = AmfileUploader.CustomSettings.icoUpload_css;
        }
    }
    // 时间进行信息更新
    AmfileUploader.progress.prototype.setTimeProgress = function(use_time, up_size, bytesLoaded, bytesTotal)
    {
        var s_b = use_time == 0 ? up_size : up_size / use_time * 1000;  // 一秒上传多少b

        var time_str;
        if(s_b > 1024*1024)
            time_str = (s_b/(1024*1024)).toFixed(2) + 'MB/S';
        else
            time_str = (s_b/1024).toFixed(2) + 'KB/S';
        this.velocity.innerHTML = time_str;

        var SecondsRemaining = (bytesTotal-bytesLoaded)/s_b;    // 上传完毕还需多少秒
        if (SecondsRemaining > 3600)
            time_str = (SecondsRemaining/3600).toFixed(2) + '小时';
        else if (SecondsRemaining > 60)
            time_str = (SecondsRemaining/60).toFixed(2) + '分钟';
        else
            time_str = (SecondsRemaining).toFixed(2) + '秒';

        this.SecondsRemaining.innerHTML = '估计还需:' + time_str;
    }
    // 设置上传进度
    AmfileUploader.progress.prototype.setProgress = function(percent)
    {
        this.stateBar.style.width = percent + "%";
        this.percentSpan.innerHTML = percent + "%";
        if (percent == 100)
        {
            this.hrefSpan.style.display = "none";
            this.SecondsRemaining.innerHTML = '文件保存中...';
        }
    }
    // 恢复默认设置
   AmfileUploader.progress.prototype.reset = function()
    {
        this.stateButton = this.fileProgressElement.childNodes[0];
        this.fileSpan = this.fileProgressElement.childNodes[1];
        this.stateDiv = this.fileProgressElement.childNodes[2];
        this.stateBar = this.stateDiv.childNodes[0];
        this.percentSpan = this.fileProgressElement.childNodes[3];
        this.velocity = this.fileProgressElement.childNodes[4];
        this.SecondsRemaining = this.fileProgressElement.childNodes[5];
        this.hrefSpan = this.fileProgressElement.childNodes[6];
        this.hrefControl = this.hrefSpan.childNodes[0];
    }
    // 上传完成
    AmfileUploader.progress.prototype.setComplete = function(use_time)
    {
        this.stateButton.className = AmfileUploader.CustomSettings.icoNormal_css;
        this.hrefSpan.style.display = "none";

        use_time = use_time / 1000;
        if (use_time > 3600)
            time_str = (use_time/3600).toFixed(2) + '小时';
        else if (use_time > 60)
            time_str = (use_time/60).toFixed(2) + '分钟';
        else
            time_str = (use_time).toFixed(2) + '秒';

        this.SecondsRemaining.innerHTML = '用时:' + time_str;
    }
    // 计算文件大小的文字描述,传入参数单位为字节
    AmfileUploader.progress.prototype.formatUnits = function (size)
    {    
        if (isNaN(size) || size == null)
            size = 0;

        if (size <= 0) return size + "bytes";

        var t1 = (size / 1024).toFixed(2);
        if (t1 < 0)
            return "0KB";

        if (t1 > 0 && t1 < 1024)
            return t1 + "KB";

        var t2 = (t1 / 1024).toFixed(2);
        if (t2 < 1024)
            return t2 + "MB";

        return (t2 / 1024).toFixed(2) + "GB";
    }

}