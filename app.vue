<template>
  <div class="max-w-lg mx-auto px-4 my-7">
    <div class="">
      <h1
        class="
          text-transparent
          font-extrabold
          text-2xl
          bg-clip-text bg-gradient-to-r
          from-blue-600
          via-green-500
          to-indigo-400
        "
      >
        Gacha Tracker
      </h1>
      <div class="text-gray-800 italic text-sm mb-2">
        Easily track your gacha, no need to giveaway your account's link, 100%
        safe from ban/hack. Made by @antonybudianto.
      </div>
      <div class="text-gray-800 italic text-sm mb-2">
        <strong>How it works?</strong> Simply go to your game record, and see
        <strong>which page and row/No. of your recent 5* item</strong>, only add
        ones you wish to track and the pity count will be automatically
        generated!
      </div>
    </div>
    <div id="tablegacha" class="table-container pb-2" ref="tableContainer">
      <table class="gacha-table w-full">
        <thead>
          <tr>
            <th
              class="px-2 border-l border-r text-bold bg-cyan-50 text-cyan-900"
            >
              Page
            </th>
            <th
              class="
                px-2
                border-l border-r
                text-bold
                bg-cyan-50
                text-cyan-900
                w-2
              "
            >
              Row
            </th>
            <th
              class="px-2 border-l border-r text-bold bg-cyan-50 text-cyan-900"
            >
              Item/char
            </th>
            <th
              class="px-2 border-l border-r text-bold bg-cyan-50 text-cyan-900"
              title="generated"
            >
              Pity*
            </th>
            <th
              id="optionCol"
              class="px-2 border-l border-r text-bold bg-cyan-50 text-cyan-900"
            >
              Options
            </th>
          </tr>
        </thead>
        <tbody class="text-center text-sm">
          <tr v-for="(d, i) in data" :key="i">
            <td class="py-2 border-l border-b bg-gray-50">{{ d.page }}</td>
            <td class="py-2 border-l border-b bg-gray-50">{{ d.row }}</td>
            <td
              class="
                py-2
                border-l border-b
                bg-gray-50
                text-orange-400
                font-bold
                w-1/2
              "
            >
              {{ d.item }}
            </td>
            <td
              class="py-2 border-l border-b bg-gray-50"
              :title="
                isLastEntry(i)
                  ? 'Each entry needs the next entry to calc pity, since this is the last, it has no pity count'
                  : ''
              "
              :class="getClassStyle(i)"
            >
              {{ isLastEntry(i) ? '---' : getPity(i) }}
            </td>
            <td class="py-2 border-l border-b bg-gray-50 text-right">
              <button
                class="
                  rounded
                  shadow
                  bg-red-300
                  px-2
                  hover:bg-red-500
                  select-none
                "
                @click="deleteItem(i)"
              >
                x
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2"></td>
            <td class="text-sm">
              <strong>AVG:</strong>
              {{
                totalPulls === 0
                  ? 0
                  : Math.round(
                      100 *
                        (totalPulls / data.length - (includeLastEntry ? 1 : 0))
                    ) / 100
              }}
              pulls
            </td>
            <td colspan="2">
              {{ totalPulls }} <small>pulls</small>.
              <small>est. ~{{ formatMoney(countPulls(totalPulls)) }}</small>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="flex justify-between items-center">
      <label class="flex justify-center">
        <input type="checkbox" v-model="includeLastEntry" />
        <span
          class="select-none text-sm"
          title="Include last entry in pity and cost calculation. Usually, last entry is the previous banner data and you don't want to count it, but we can calc it as your first gacha"
          >Mark last entry as initial gacha</span
        >
      </label>
      <button
        class="
          px-3
          py-2
          bg-cyan-100
          hover:bg-cyan-200
          text-gray-800
          rounded
          shadow
          border
          select-none
        "
        type="button"
        @click="handleDownload"
      >
        Save as img
      </button>
    </div>
    <hr class="mt-5" />

    <h3>Enter your data from latest page with 5*:</h3>
    <form @submit="handleSubmit">
      <div class="mt-2">
        <label for="page">Which page ur 5* at...</label>
        <input
          class="rounded shadow p-1 border w-20"
          type="number"
          min="1"
          v-model="page"
          id="page"
          name="page"
          placeholder="Which page your 5* char..."
        />
      </div>
      <div class="mt-2">
        <label for="page">Which row ur 5* at...</label>
        <input
          class="rounded shadow p-1 border w-20"
          type="number"
          min="1"
          name="row"
          v-model="row"
          placeholder="Which row your 5* char at..."
        />
      </div>
      <div class="my-2 flex justify-between">
        <div class="">
          <label for="page">Your 5* name...</label>
          <input
            class="rounded shadow p-1 border"
            type="text"
            v-model="name"
            name="name"
            placeholder="input name..."
            autocomplete="off"
          />
        </div>

        <button
          class="
            px-3
            py-2
            bg-cyan-900
            hover:bg-cyan-800
            text-gray-50
            rounded
            shadow
            border
            select-none
            disabled:bg-gray-200
          "
          type="submit"
          :disabled="name === ''"
        >
          Add data
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 50vh;
  overflow: auto;
  background: white;
  color: black;
}
</style>

<script setup lang="ts">
// import '@/asset/main.css';

import { ref, computed } from 'vue';
import { toPng } from 'html-to-image';
// @ts-ignore
import download from 'downloadjs';
import { primoToCurrency } from '~/util/gacha';

const countPulls = (p: number) => {
  return primoToCurrency(p * 160);
};
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'IDR',
});

const tableContainer = ref<HTMLTableElement | null>(null);
const row = ref(1);
const page = ref(1);
const name = ref('');
const localData = JSON.parse(localStorage.getItem('gachadata') || '[]');
const data = ref(
  localData.length
    ? localData
    : [
        {
          page: 1,
          row: 1,
          item: 'Fu Xuan',
        },
        {
          page: 3,
          row: 3,
          item: 'Fu Xuan',
        },
        {
          page: 15,
          row: 2,
          item: 'Welt',
        },
      ]
);
const includeLastEntry = ref(false);

const isLastEntry = (i: number) => {
  return i === data.value.length - 1 && !includeLastEntry.value;
};
const getClassStyle = (i: number) => {
  const pt = getPity(i);
  if (i === data.value.length - 1 && !includeLastEntry.value) {
    return {};
  }
  return {
    'bg-green-100': pt <= 40,
    'bg-orange-100': pt > 40 && pt < 80,
    'bg-red-200': pt >= 80,
  };
};
const totalPulls = computed(() => {
  return data.value.reduce((total, _, i) => {
    const pity =
      i === data.value.length - 1 && !includeLastEntry.value ? 0 : getPity(i);
    return total + pity;
  }, 0);
});

const formatMoney = (n: number) => formatter.format(n);

const handleDownload = () => {
  console.log(data);
  document
    .querySelectorAll<HTMLElement>(
      '#tablegacha > table > *:not(tfoot) > tr > *:last-child'
    )
    .forEach((td) => {
      td.style.display = 'none';
    });
  const tableEl = document.getElementById('tablegacha') as HTMLElement;
  tableEl.style.overflow = 'hidden';
  tableEl.style.maxHeight = '100%';
  toPng(tableEl)
    .then(function (dataUrl) {
      download(dataUrl, 'my-node.png', 'image/jpeg');
    })
    .finally(() => {
      document
        .querySelectorAll<HTMLElement>(
          '#tablegacha > table > *:not(tfoot) > tr > *:last-child'
        )
        .forEach((td) => {
          td.style.display = 'table-cell';
          tableEl.style.overflow = 'auto';
          tableEl.style.maxHeight = '150vh';
        });
    });
};

const deleteItem = (i: number) => {
  data.value.splice(i, 1);
  localStorage.setItem('gachadata', JSON.stringify(data.value));
};

const getPity = (i: number) => {
  const p1 = data.value[i].page;
  const p2 = data.value[i + 1]?.page || p1;
  const r1 = data.value[i].row;
  const r2 = data.value[i + 1]?.row || 5 + 1;
  return (p2 - p1 + 1) * 5 - (5 - (r2 - 1)) - (r1 - 1);
};

const handleSubmit = (e: Event) => {
  e.preventDefault();
  data.value.push({
    page: page.value,
    row: row.value,
    item: name.value,
  });
  data.value.sort((a, b) => {
    return a.page - b.page || a.row - b.row;
  });
  localStorage.setItem('gachadata', JSON.stringify(data.value));
  name.value = '';
  if (tableContainer.value) {
    tableContainer.value.scrollTop = tableContainer.value.scrollHeight + 500;
  }
};
</script>
