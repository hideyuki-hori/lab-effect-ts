/* @refresh reload */

import { Effect, Option, pipe } from 'effect'
import { render } from 'solid-js/web'

pipe(
  Effect.sync(() => Option.fromNullable(document.getElementById('app'))),
  Effect.flatMap(
    Option.match({
      onNone: () => Effect.fail(new Error('Element not found')),
      onSome: (el: HTMLElement) => Effect.sync(() => render(() => <div>a</div>, el)),
    })
  ),
  Effect.runSync,
)

/*
↓ChatGPT

# Effect-TS 実行関数の比較ガイド

## 🧵 1. `Effect.runFork`

**概要**  
Effectを非同期に実行し、`Fiber`（軽量スレッド）を返す。

**特徴**
- 実行直後に `Fiber` を返す（非同期）
- `interrupt`, `await`, `join` など可能
- Promiseを返さない
- 長期実行タスクや監視用途に向く

**例**
```ts
const fiber = Effect.runFork(myEffect)

setTimeout(() => {
  Effect.runFork(Fiber.interrupt(fiber))
}, 500)
```

---

## 🔁 2. `Effect.runCallback`

**概要**  
Effectを非同期に実行し、`Exit` をコールバックに渡す。

**特徴**
- 成功・失敗を `Exit` 型で扱う
- 複数回呼ばれない（ワンショット）
- Node.jsのようなコールバックベースAPIに適する

**例**
```ts
Effect.runCallback(myEffect, exit => {
  if (Exit.isSuccess(exit)) console.log(exit.value)
})
```

---

## 📦 3. `Effect.runPromise`

**概要**  
Effectを非同期に実行し、結果を `Promise` として返す。

**特徴**
- 成功 → resolve
- 失敗 → reject（`throw` される）
- `async/await` に最適

**例**
```ts
await Effect.runPromise(Effect.succeed(1))  // 1
await Effect.runPromise(Effect.fail("err")) // throws Error
```

---

## 📬 4. `Effect.runPromiseExit`

**概要**  
Effectを `Promise<Exit>` 形式で返す。失敗も reject しない。

**特徴**
- 成功 → `Exit.Success`
- 失敗 → `Exit.Failure`
- Promiseで結果を安全に扱いたい場合に有効

**例**
```ts
const exit = await Effect.runPromiseExit(myEffect)
if (Exit.isFailure(exit)) {
  console.error(exit.cause)
}
```

---

## ⚡ 5. `Effect.runSync`

**概要**  
Effectを**同期的に即時評価**する。失敗すると `throw`。

**特徴**
- 非同期処理は実行不可（例外）
- 失敗すると `throw`
- 成功が保証されている同期Effectにのみ使うべき

**例**
```ts
const result = Effect.runSync(Effect.succeed(1)) // OK

Effect.runSync(Effect.fail("err")) // throws

Effect.runSync(Effect.promise(() => Promise.resolve(1)))
// throws: async operation not allowed
```

---

## 🛑 6. `Effect.runSyncExit`

**概要**  
Effectを同期で実行し、結果を `Exit` 型で返す。

**特徴**
- 失敗しても `throw` せず `Exit.Failure`
- 成功時は `Exit.Success`
- 非同期処理が含まれていると `Die` になる

**例**
```ts
const exit = Effect.runSyncExit(Effect.succeed(1))
// Exit.Success(1)

const failExit = Effect.runSyncExit(Effect.fail("err"))
// Exit.Failure with Cause.Fail("err")
```

---

## ✅ 一覧比較表

| 関数               | 実行タイプ | 戻り値                   | 非同期OK | 失敗の扱い          | 主な用途                           |
|--------------------|------------|----------------------------|----------|----------------------|------------------------------------|
| `runFork`          | 非同期     | `Fiber`                   | ✅       | Fiber経由で観察      | 並列処理、常駐タスク、監視         |
| `runCallback`      | 非同期     | `void`（callbackに渡る）  | ✅       | `Exit` で扱う         | コールバックベース統合              |
| `runPromise`       | 非同期     | `Promise<A>`              | ✅       | `throw`される         | async/await連携                    |
| `runPromiseExit`   | 非同期     | `Promise<Exit<A, E>>`     | ✅       | `Exit`に包まれる      | 詳細なエラー管理、外部統合        |
| `runSync`          | 同期       | `A`                       | ❌       | 失敗時は `throw`      | 初期化、副作用、同期ログ出力など  |
| `runSyncExit`      | 同期       | `Exit<A, E>`              | ❌       | `Exit.Failure`         | デバッグ・診断・安全な同期実行     |
*/