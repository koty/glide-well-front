<template>
  <div>
    <h1>Workouts List</h1>
    <el-button type="primary" @click="showWorkout(null)">new workout</el-button>
    <el-table
            :data="workouts"
            style="width: 100%">
      <el-table-column
              prop="date"
              label="Date"
              width="120">
      </el-table-column>
      <el-table-column
              label="種別"
              width="60">
        <template slot-scope="scope">
          <font-awesome-icon v-if="scope.row.kind === 'swimming'" icon="swimmer"></font-awesome-icon>
          <font-awesome-icon v-else-if="scope.row.kind === 'bicycle'" icon="bicycle"></font-awesome-icon>
        </template>
      </el-table-column>
      <el-table-column
              label="距離(m)"
              width="70">
        <template slot-scope="scope">
          {{totalDistance(scope.row.workout_details)}}
        </template>
      </el-table-column>
      <el-table-column
              label=""
              width="180">
        <template slot-scope="scope">
          <el-button type="primary" @click="showWorkout(scope.row)">
            <font-awesome-icon icon="edit"></font-awesome-icon>
          </el-button>
          <el-button type="secondary" @click="deleteWorkout(scope.row)">
            <font-awesome-icon icon="trash"></font-awesome-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
            title="Workout"
            :visible.sync="dialogVisible"
            width="90%">
      <el-form :model="selectedWorkout">
        <el-row>
          <el-form-item prop="date" label="日付">
            <el-date-picker v-model="selectedWorkout.date"></el-date-picker>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item prop="kind" label="種別">
            <el-select v-model="selectedWorkout.kind" placeholder="Kind">
              <el-option label="swimming" value="swimming"></el-option>
              <el-option label="bicycle" value="bicycle"></el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item prop="impression" label="所感">
            <el-input type="textarea" v-model="selectedWorkout.impression"></el-input>
          </el-form-item>
        </el-row>
        <el-row>
          <el-table
                  :data="selectedWorkout.workout_details"
                  style="width: 100%">
            <el-table-column
                    prop="menu_kind"
                    label="種目"
                    width="100">
              <template slot-scope="scope">
                <el-select v-model="scope.row.menu_kind">
                  <el-option v-for="item of menu_kinds" :value="item.value" :label="item.text">{{item.text}}</el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
                    label="距離(m)"
                    width="70">
              <template slot-scope="scope">
                <el-input type="number" v-model="scope.row.distance"></el-input>
              </template>
            </el-table-column>
            <el-table-column
                    label="本数"
                    width="50">
              <template slot-scope="scope">
                <el-input type="number" v-model="scope.row.times"></el-input>
              </template>
            </el-table-column>
            <el-table-column
                    label="インターバル(sec"
                    width="70">
              <template slot-scope="scope">
                <el-input type="number" v-model="scope.row.interval"></el-input>
              </template>
            </el-table-column>
            <el-table-column
                    label="メモ"
                    width="70">
              <template slot-scope="scope">
                <el-input type="textarea" v-model="scope.row.note"></el-input>
              </template>
            </el-table-column>
            <el-table-column
                    label=""
                    width="150">
              <template slot-scope="scope">
                <el-button type="secondary" @click="deleteDetail(scope)">
                  <font-awesome-icon icon="trash"></font-awesome-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-form>
      <el-row>
        <el-button type="secondary" @click="addDetail" style="margin-top: 5px;">追加</el-button>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createSlackContent" type="secondary"><i class="fas fa-copy"></i> slack</el-button>
        <el-button @click="dialogVisible = false" type="secondary">閉じる</el-button>
        <el-button type="primary" @click="saveWorkout" :loading="isSaving">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  interface WorkoutRecord {
    id?: number;
    date: string;
    kind: string;
    workout_details: Array<WorkoutDetail>,
  }
  interface WorkoutDetail {
    menu_kind: number;
    distance: number;
    times: number;
    interval: number;
    note: string;
  }
  interface OptionItem {
    value: number;
    text: string;
  }
  @Component
  export default class Workout extends Vue {
    dialogVisible = false;
    isSaving = false;
    menu_kinds: OptionItem[] = [
      {value: 1, text: "swim"},
      {value: 2, text: "kick"},
      {value: 3, text: "paddle"},
      {value: 4, text: "IM"},
      {value: 5, text: "dash"},
    ];
    workouts: WorkoutRecord[] = [];
    totalDistance(rec: Array<any>): string {
      const distance = rec.map(x => x.distance * x.times).reduce((a, b) => a + b, 0);
      return String(distance).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' );
    }
    selectedWorkout: WorkoutRecord = { date: '', kind: '', workout_details: []};
    showWorkout(workout: WorkoutRecord) {
      this.selectedWorkout = workout ? workout : { date: '', kind: '', workout_details: []};
      this.dialogVisible = true;
    }

    async created() {
      this.fetchWorkouts();
    }
    async fetchWorkouts() {
      const response = await fetch('https://glide-well.b-sw.co/api/workouts');
      const data = await response.json();
      this.workouts = data.workouts as WorkoutRecord[];
    }
    async saveWorkout() {
      this.isSaving = true;
      if (this.selectedWorkout.id) {
        // update
        const id = this.selectedWorkout.id;
        const response = await fetch(`https://glide-well.b-sw.co/api/workouts/${id}/`, {
          method: 'put', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, cors, *same-origin
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.selectedWorkout), // body data type must match "Content-Type" header
        });
      } else {
        // create
        const response = await fetch('https://glide-well.b-sw.co/api/workouts/', {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, cors, *same-origin
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.selectedWorkout), // body data type must match "Content-Type" header
        });
        const data = await response.json();
        this.selectedWorkout = data.workout;
      }
      this.isSaving = false;
      this.$message('保存しました');
      this.fetchWorkouts();
    }
    addDetail() {
      this.selectedWorkout.workout_details.push({menu_kind: 1, distance: 200, times:4, interval: 210, note: ''})
    }
    deleteWorkout(workout: WorkoutRecord) {
      this.$confirm('本当に削除しますか？', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        const id = workout.id;
        const response = await fetch(`https://glide-well.b-sw.co/api/workouts/${id}/`, {
          method: 'delete', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, cors, *same-origin
          headers: {
            'Content-Type': 'application/json',
          }
        });
      })
    }
    deleteDetail(scope: any) {
      console.log(scope);
    }
    kindToText(kindValue: number) {
      const found = this.menu_kinds.filter(x => x.value === kindValue);
      if (found.length === 0) {
        return '';
      }
      return found[0].text
    }
    toMinutes (seconds: number) {
      if (!seconds) {
        return '';
      }
      const min = Math.floor(seconds / 60);
      const sec = seconds - (60 * min);
      return `${min}'${sec}`;
    }
    createSlackContent() {
      const details = this.selectedWorkout.workout_details.map(x => `${this.kindToText(x.menu_kind)} ${x.distance}m*${x.times} @${this.toMinutes(x.interval)}`).join('\n')
      const total = this.totalDistance(this.selectedWorkout.workout_details);
      const body = `水泳 :man-swimming:

${details}

total: ${total}m
`
      this.execCopy(body);
      alert('copied!')
    }
    execCopy (str: string) {
      // https://qiita.com/simiraaaa/items/2e7478d72f365aa48356
      // 空div 生成
      const tmp = document.createElement("div");
      // 選択用のタグ生成
      const pre = document.createElement('pre');

      // 親要素のCSSで user-select: none だとコピーできないので書き換える
      pre.style.webkitUserSelect = 'auto';
      pre.style.userSelect = 'auto';

      tmp.appendChild(pre).textContent = str;

      // 要素を画面外へ
      const s = tmp.style;
      s.position = 'fixed';
      s.right = '200%';

      // body に追加
      document.body.appendChild(tmp);
      // 要素を選択
      const selection = document.getSelection();
      if (!selection) {
        return;
      }
      selection.selectAllChildren(tmp);

      // クリップボードにコピー
      const result = document.execCommand("copy");

      // 要素削除
      document.body.removeChild(tmp);

      return result;
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
</style>
<style>
  .el-input__inner {
    padding: 5px;
    height: 30px;
    line-height: 30px;
  }
  .el-table th, .el-table td {
    padding: 5px;
  }
  .el-form-item {
    margin-bottom: 5px;
  }
</style>
