import { Effect, Console } from 'effect'

// Error handling
// https://github.com/Effect-TS/effect/blob/main/packages/effect/src/internal/runtime.ts#L159
// Effectで包んで実行すること。
// 独自でthrowするのではなくunsafeRunSyncがthrowする。

// 成功
const succeed = Effect.succeed('ok')
// この時点ではthrowされない
const fail = Effect.fail(new Error('ng'))

Effect.runSync(succeed.pipe(
  Effect.tap(Console.log)
))

// throwされるのでアプリが止まる
// Effect.runSync(fail)

// エラーを捕まえて処理可能
Effect.runSync(
  fail.pipe(
    // try/catchではerrorの型がつけられない(unknown型)のため、明確に型を付けられるのがメリット
    Effect.catchAll(error => Console.log(`caught: ${error.message}`))
  )
)

/*
ChatGPT↓
2025/05/08 学習記録：Effectの失敗と例外処理について
==================================================

■ 1. Effect.fail は throw しない
----------------------------------
- Effect.fail は失敗する Effect を「記述」するだけ。
- この時点では throw は発生しない。
- Effect.runSync などで評価されたときに、内部で throw に変換される。

■ 2. throw を実際に行うのは run 時の処理
-------------------------------------------
- unsafeRunSync / runSync の中で Exit が Failure であれば throw される。
- Effect.fail の責任ではなく、run する側が throw を担う。

■ 3. catchAll を使えば throw せずに失敗を処理できる
---------------------------------------------------
- catchAll は Effect.fail による失敗を受け取って回復処理を行う。
- try/catch と異なり、型が明示されており安全。
- JS の catch との混同を避けるため、名前が "catchAll" になっている。

■ 4. catchAll の命名理由
---------------------------
- catchSome や catchTag との対比のため、"All" が付いている。
- JavaScript の構文キーワード catch との混乱を避ける意味もある。
- 関数型プログラミングの文脈では命名の粒度を明示するのが慣例。

■ 5. Effect は実行時例外をどう扱うか？
-----------------------------------------
- 基本的に throw は禁止ではないが、「閉じ込めて制御」すべき。
- Effect.sync(() => throw ...) → Exit.die(...) になる。
- try/catch の代わりに Effect.try(...) を使って失敗を構造化できる。

■ 6. まとめ
-------------
- Effect の基本思想は、副作用も失敗も例外も「記述」し、「制御可能にする」こと。
- throw してはいけないのではなく、throw を制御できる形に変換すべき。
- catchAll により失敗を明示的に扱えるため、try/catch より安全・明確。
*/

/*
Effect は実行時例外を許すのか？
==============================

■ 結論：
Effect は「実行時例外を原則として許さない設計思想」である。
ただし、技術的には例外を閉じ込めて処理できる仕組みが備わっている。

------------------------------------------------------------

■ Effect は例外をどう扱うのか？

1. 基本原則：
   - Effect の中では throw を直接書かず、Effect.sync や Effect.try を使うことで
     副作用や例外を Effect に「閉じ込めて制御可能にする」。

2. throw が発生する場合：
   - Effect.sync(() => { throw new Error(...) }) のようなコードは
     評価時に "die"（致命的な失敗）として扱われる。
   - Effect.runSyncExit(...) で実行すれば Exit.die(...) となり、throw せずに扱える。

3. 例外を recover したい場合：
   - Effect.try(...) を使うことで、throw を fail に変換し、catchAll などで回復できる。

------------------------------------------------------------

■ 例：

const danger = Effect.sync(() => {
  throw new Error("Boom")
})

Effect.runSyncExit(danger)
// => Exit.die(Error: Boom)

const safe = Effect.try({
  try: () => JSON.parse("bad-json"),
  catch: (e) => new Error("parse failed")
})

Effect.runSync(safe)
// => throw されず、catch で変換された値が使われる

------------------------------------------------------------

■ Effect が明示的に throw するのはどこ？

- Effect.runSync や unsafeRunSync などで「評価」されたときに
  Exit.Failure を throw に変換する。これはライブラリ側の責任として明示されている。

------------------------------------------------------------

■ まとめ：

- Effect の設計は「副作用や例外をすべて明示的な文脈（Effect）に閉じ込める」ことが原則。
- 技術的には throw を許容するが、それは "閉じ込めて制御する" ため。
- 許すというより「扱える」「変換できる」「制御できる」と考えるべき。

------------------------------------------------------------

Effect における catchAll という名前について

----------------------------

■ 結論：
catch ではなく catchAll という名前になっているのは、
「すべての失敗（E）を捕捉する」ことを明示するため。

部分的な捕捉（catchSome や catchTag など）との対比が意図されている。

----------------------------

■ なぜ catch ではだめなのか？

1. JavaScript の try/catch 構文との混同を避けるため
   → JSの catch は言語キーワード。混同を避ける必要がある。

2. catchSome とペアで設計されている
   → catchSome：一部のエラーを処理
   → catchAll：すべてのエラーを処理
   → 「All」が付いていることで意味が明確になる。

3. 関数型ライブラリの命名規則に則っている
   → Scala ZIO や fp-ts などでも同様に catchAll, catchSome が使われている。
   → 「部分適用」と「全部捕捉」は区別するのが通例。

----------------------------

■ Effect の主な catch 系関数

- catchAll：すべての失敗を処理する
- catchSome：一部の失敗（条件付き）を処理する
- catchTag：タグ付きユニオンの一部のみ処理する
- catch：存在しない（混乱を避けるため、あえて定義されていない）

----------------------------

■ 補足：
catchAll は「例外を投げる」のではなく、「Effect.fail で記述された失敗の値（E）を受け取る関数」です。
副作用やエラー処理を構造化し、安全に連鎖させるために使われます。
*/
