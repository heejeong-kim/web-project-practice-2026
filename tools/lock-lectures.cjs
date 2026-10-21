/* 비밀번호 원문은 파일·인자·환경변수에 저장하지 않는다.
   최초 잠금: node tools/lock-lectures.cjs
   출력되는 비밀번호는 소유자에게 대화로만 전달한다. 이미 잠긴 파일은 덮어쓰지 않는다. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(__dirname,'..');
const password = crypto.randomBytes(18).toString('base64url');
const iterations = 600000;
const pending = [];
for (let week=9;week<=15;week++) {
  const n=String(week).padStart(2,'0');
  const source=path.join(root,'data/lectures',`week${n}.md`);
  const output=path.join(root,'data/secure',`lecture-${n}.enc.json`);
  if(fs.existsSync(output)) throw new Error('이미 잠긴 교안이 있어 중단했습니다.');
  const plain=fs.readFileSync(source);
  const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12);
  const key=crypto.pbkdf2Sync(password,salt,iterations,32,'sha256');
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const data=Buffer.concat([cipher.update(plain),cipher.final(),cipher.getAuthTag()]);
  const payload={version:1,algorithm:'AES-GCM',kdf:'PBKDF2',hash:'SHA-256',iterations,salt:salt.toString('base64'),iv:iv.toString('base64'),data:data.toString('base64')};
  const verify=crypto.createDecipheriv('aes-256-gcm',key,iv);verify.setAuthTag(data.subarray(-16));
  if(!Buffer.concat([verify.update(data.subarray(0,-16)),verify.final()]).equals(plain))throw Error('암호화 검증 실패');
  pending.push({week,source,output,payload});
}
for(const item of pending){
  fs.writeFileSync(item.output,JSON.stringify(item.payload));
  fs.writeFileSync(item.source,'<!-- protected-lecture: encrypted -->\n이 교안은 암호화되어 있습니다. 강의교안 화면에서 비밀번호를 입력하세요.\n');
}
const manifestPath=path.join(root,'data/secure/manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath));manifest.protectedWeeks=pending.map(x=>x.week);
fs.writeFileSync(manifestPath,JSON.stringify(manifest));
require('child_process').execFileSync('python3',[path.join(root,'tools/build-local-data.py')],{stdio:'pipe'});
// 생성 비밀번호가 파일 내용·경로에 들어가지 않았는지 확인한다.
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name==='.git')continue;const target=path.join(dir,entry.name);if(target.includes(password))throw Error('경로 검사 실패');if(entry.isDirectory())scan(target);else if(entry.isFile()&&fs.readFileSync(target).includes(Buffer.from(password)))throw Error('파일 검사 실패');}}
scan(root);
console.log(JSON.stringify({password,weeks:pending.map(x=>x.week),roundTrip:true,passwordAbsentFromFiles:true}));
